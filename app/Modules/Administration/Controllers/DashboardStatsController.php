<?php

namespace App\Modules\Administration\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\ERP\Models\Order;
use App\Modules\ERP\Models\QuoteRequest;
use App\Modules\Management\Models\Comment;
use App\Modules\Management\Models\Contact;
use App\Modules\Management\Models\Partner;
use App\Modules\Management\Models\Post;
use App\Modules\Management\Models\Product;
use App\Modules\Settings\Models\Category;
use App\Modules\Settings\Models\Newsletter;
use App\Traits\ApiResponses;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;

class DashboardStatsController extends Controller
{
    use ApiResponses;

    private const CACHE_KEY = 'admin:stats:dashboard';
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Agrégats du tableau de bord admin. Cache 5 minutes pour ne pas taper
     * sur la BDD à chaque chargement de page.
     * Invalider : DashboardStatsController::flushCache()
     */
    public function index()
    {
        try {
            $stats = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function (): array {
                return $this->buildStats();
            });
        } catch (\Throwable) {
            $stats = $this->buildStats();
        }

        return $this->successResponse($stats, 'Statistiques dashboard chargées avec succès.');
    }

    public static function flushCache(): void
    {
        try {
            Cache::forget(self::CACHE_KEY);
        } catch (\Throwable) {
        }
    }

    // ————————————————————————————————————————————————————————————————————————
    // Builders
    // ————————————————————————————————————————————————————————————————————————

    private function buildStats(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfPrevMonth = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $endOfPrevMonth = $now->copy()->subMonthNoOverflow()->endOfMonth();

        return [
            'generated_at' => $now->toISOString(),
            'kpis' => $this->buildKpis($startOfMonth, $startOfPrevMonth, $endOfPrevMonth),
            'monthly_revenue' => $this->buildMonthlyRevenue(12),
            'quote_monthly_counts' => $this->buildQuoteRequestMonthlyCounts(6),
            'order_status_breakdown' => $this->buildOrderStatusBreakdown(),
            'quote_status_breakdown' => $this->buildQuoteStatusBreakdown(),
            'low_stock_products' => $this->buildLowStockProducts(),
            'pending_items' => $this->buildPendingItems(),
            'recent_orders' => $this->buildRecentOrders(8),
            'recent_quotes' => $this->buildRecentQuotes(8),
            'recent_contacts' => $this->buildRecentContacts(8),
            'unapproved_comments_count' => (int) Comment::where('is_approved', false)->count(),
        ];
    }

    private function buildKpis(Carbon $startOfMonth, Carbon $startOfPrevMonth, Carbon $endOfPrevMonth): array
    {
        $productsTotal = (int) Product::count();
        $productsPublished = (int) Product::where('is_published', true)->count();
        $productsUnavailable = (int) Product::where('is_available', false)
            ->orWhereColumn('stock', '<=', 0)
            ->count();

        $ordersTotal = (int) Order::count();
        $ordersNew = (int) Order::whereIn('status', ['new', 'pending'])->count();
        $ordersThisMonth = $this->sumOrderItemsTotal(
            Order::where('orders.created_at', '>=', $startOfMonth)
                ->whereIn('orders.status', ['confirmed', 'delivered'])
        );
        $ordersPrevMonth = $this->sumOrderItemsTotal(
            Order::whereBetween('orders.created_at', [$startOfPrevMonth, $endOfPrevMonth])
                ->whereIn('orders.status', ['confirmed', 'delivered'])
        );

        $quoteTotal = (int) QuoteRequest::count();
        $quotePending = (int) QuoteRequest::whereIn('status', ['new', 'priced'])->count();
        $quoteApproved = (int) QuoteRequest::where('status', 'approved')->count();

        $contactsTotal = (int) Contact::count();
        $contactsNew7d = (int) Contact::where('created_at', '>=', Carbon::now()->subDays(7))->count();
        $newsletterTotal = (int) Newsletter::count();
        $newsletterVerified = (int) Newsletter::where('is_verified', true)->count();
        $newsletterNew30d = (int) Newsletter::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        $postsTotal = (int) Post::count();
        $postsPublished = (int) Post::where('is_published', true)->count();
        $postsLast6m = (int) Post::where('created_at', '>=', Carbon::now()->subMonths(6))->count();

        $revenueVariation = $ordersPrevMonth > 0
            ? round((($ordersThisMonth - $ordersPrevMonth) / $ordersPrevMonth) * 100, 1)
            : ($ordersThisMonth > 0 ? 100 : 0);

        $partnersTotal = (int) Partner::count();
        $categoriesTotal = (int) Category::count();

        return [
            'products' => [
                'label' => 'Produits',
                'value' => $productsTotal,
                'published' => $productsPublished,
                'unavailable' => $productsUnavailable,
                'variation_30d' => null,
            ],
            'revenue_month_confirmed' => [
                'label' => 'CA confirmé du mois',
                'value' => (float) $ordersThisMonth,
                'value_formatted' => $this->formatGnf((float) $ordersThisMonth),
                'variation_vs_last_month_pct' => $revenueVariation,
                'previous_value' => (float) $ordersPrevMonth,
                'previous_value_formatted' => $this->formatGnf((float) $ordersPrevMonth),
            ],
            'orders' => [
                'label' => 'Commandes',
                'value' => $ordersTotal,
                'pending' => $ordersNew,
                'month_count' => (int) Order::where('created_at', '>=', $startOfMonth)->count(),
            ],
            'quotes' => [
                'label' => 'Demandes de devis',
                'value' => $quoteTotal,
                'pending' => $quotePending,
                'approved' => $quoteApproved,
            ],
            'contacts' => [
                'label' => 'Messages contact',
                'value' => $contactsTotal,
                'new_7d' => $contactsNew7d,
            ],
            'newsletter' => [
                'label' => 'Abonnés newsletter',
                'value' => $newsletterTotal,
                'verified' => $newsletterVerified,
                'new_30d' => $newsletterNew30d,
            ],
            'posts' => [
                'label' => 'Actualités',
                'value' => $postsTotal,
                'published' => $postsPublished,
                'last_6m' => $postsLast6m,
            ],
            'partners' => [
                'label' => 'Partenaires',
                'value' => $partnersTotal,
                'categories_total' => $categoriesTotal,
            ],
        ];
    }

    /**
     * @return list<array{month_label: string, month_key: string, revenue_confirmed: float, revenue_formatted: string, orders_count: int, quotes_count: int}>
     */
    private function buildMonthlyRevenue(int $months = 12): array
    {
        $start = Carbon::now()->subMonths($months - 1)->startOfMonth();
        $monthsArr = [];
        for ($i = 0; $i < $months; $i++) {
            $d = $start->copy()->addMonths($i);
            $monthsArr[] = [
                'start' => $d->copy()->startOfMonth(),
                'end' => $d->copy()->endOfMonth(),
                'label' => $d->locale('fr_FR')->isoFormat('MMM YY'),
                'key' => $d->format('Y-m'),
            ];
        }

        return collect($monthsArr)->map(function ($m) {
            $revenue = $this->sumOrderItemsTotal(
                Order::whereBetween('orders.created_at', [$m['start'], $m['end']])
                    ->whereIn('orders.status', ['confirmed', 'delivered'])
            );

            $ordersCount = (int) Order::whereBetween('created_at', [$m['start'], $m['end']])->count();
            $quotesCount = (int) QuoteRequest::whereBetween('created_at', [$m['start'], $m['end']])->count();

            return [
                'month_label' => $m['label'],
                'month_key' => $m['key'],
                'revenue_confirmed' => $revenue,
                'revenue_formatted' => $this->formatGnf($revenue),
                'orders_count' => $ordersCount,
                'quotes_count' => $quotesCount,
            ];
        })->values()->all();
    }

    private function buildQuoteRequestMonthlyCounts(int $months = 6): array
    {
        $start = Carbon::now()->subMonths($months - 1)->startOfMonth();
        $out = [];
        for ($i = 0; $i < $months; $i++) {
            $d = $start->copy()->addMonths($i);
            $s = $d->copy()->startOfMonth();
            $e = $d->copy()->endOfMonth();

            $out[] = [
                'month_label' => $d->locale('fr_FR')->isoFormat('MMM YY'),
                'month_key' => $d->format('Y-m'),
                'new' => (int) QuoteRequest::whereBetween('created_at', [$s, $e])
                    ->where('status', 'new')->count(),
                'priced' => (int) QuoteRequest::whereBetween('created_at', [$s, $e])
                    ->where('status', 'priced')->count(),
                'approved' => (int) QuoteRequest::whereBetween('created_at', [$s, $e])
                    ->where('status', 'approved')->count(),
                'rejected' => (int) QuoteRequest::whereBetween('created_at', [$s, $e])
                    ->where('status', 'rejected')->count(),
                'expired' => (int) QuoteRequest::whereBetween('created_at', [$s, $e])
                    ->where('status', 'expired')->count(),
            ];
        }

        return $out;
    }

    private function buildOrderStatusBreakdown(): array
    {
        $all = Order::count();
        $statuses = ['new', 'pending', 'confirmed', 'delivered', 'canceled'];
        $labels = [
            'new' => 'Nouvelle',
            'pending' => 'En cours',
            'confirmed' => 'Confirmée',
            'delivered' => 'Livrée / Retirée',
            'canceled' => 'Annulée',
        ];

        $out = [];
        foreach ($statuses as $s) {
            $count = (int) Order::where('status', $s)->count();
            $out[] = [
                'status' => $s,
                'label' => $labels[$s] ?? $s,
                'count' => $count,
                'pct' => $all > 0 ? round(($count / $all) * 100, 1) : 0,
            ];
        }

        return [
            'total' => $all,
            'items' => $out,
        ];
    }

    private function buildQuoteStatusBreakdown(): array
    {
        $all = QuoteRequest::count();
        $statuses = ['new', 'priced', 'approved', 'rejected', 'expired'];
        $labels = [
            'new' => 'Nouvelle',
            'priced' => 'Prix envoyé',
            'approved' => 'Approuvée',
            'rejected' => 'Rejetée',
            'expired' => 'Expirée',
        ];

        $out = [];
        foreach ($statuses as $s) {
            $count = (int) QuoteRequest::where('status', $s)->count();
            $out[] = [
                'status' => $s,
                'label' => $labels[$s] ?? $s,
                'count' => $count,
                'pct' => $all > 0 ? round(($count / $all) * 100, 1) : 0,
            ];
        }

        return [
            'total' => $all,
            'items' => $out,
        ];
    }

    /**
     * Produits en stock critique (rupture ou sous le seuil).
     *
     * @return \Illuminate\Support\Collection
     */
    private function buildLowStockProducts()
    {
        return Product::query()
            ->where(function ($q) {
                $q->where('is_available', false)
                    ->orWhereColumn('stock', '<=', 'low_stock_threshold');
            })
            ->orderByRaw('stock ASC NULLS LAST')
            ->limit(15)
            ->get(['id', 'reference', 'name', 'stock', 'low_stock_threshold', 'is_available', 'unit', 'price'])
            ->map(fn($p) => [
                'id' => $p->id,
                'reference' => $p->reference,
                'name' => $p->name,
                'stock' => $p->stock,
                'low_stock_threshold' => $p->low_stock_threshold,
                'is_available' => (bool) $p->is_available,
                'unit' => $p->unit,
                'price' => $p->price ? (float) $p->price : null,
                'status_tone' => $p->stock === 0 || !$p->is_available ? 'danger' : 'warning',
                'status_label' => $p->stock === 0 || !$p->is_available ? 'Rupture' : $p->stock.' en stock (seuil)',
            ])
            ->values();
    }

    private function buildPendingItems(): array
    {
        return [
            'orders_new' => (int) Order::whereIn('status', ['new', 'pending'])->count(),
            'quotes_new' => (int) QuoteRequest::where('status', 'new')->count(),
            'contacts_unread' => (int) Contact::count(),
            'comments_unapproved' => (int) Comment::where('is_approved', false)->count(),
            'products_zero_stock' => (int) Product::where('stock', 0)
                ->orWhere('is_available', false)
                ->count(),
        ];
    }

    private function buildRecentOrders(int $limit = 8)
    {
        return Order::with(['customer'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($o) => [
                'id' => $o->id,
                'reference' => $o->reference,
                'status' => $o->status,
                'delivery_mode' => $o->delivery_mode,
                'created_at' => $o->created_at?->toISOString(),
                'created_at_fr' => $o->created_at?->locale('fr_FR')->isoFormat('D MMM YYYY HH[h]mm'),
                'customer' => [
                    'full_name' => $o->customer?->full_name,
                    'company_name' => $o->customer?->company_name,
                    'phone' => $o->customer?->phone,
                    'email' => $o->customer?->email,
                ],
                'items_count' => $o->items()->count(),
                'items_total' => (float) $o->items()->sum('total_price'),
                'items_total_formatted' => $this->formatGnf((float) $o->items()->sum('total_price')),
            ]);
    }

    private function buildRecentQuotes(int $limit = 8)
    {
        return QuoteRequest::with(['customer'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($q) => [
                'id' => $q->id,
                'reference' => $q->reference,
                'status' => $q->status,
                'validity_date' => $q->validity_date?->toISOString(),
                'created_at' => $q->created_at?->toISOString(),
                'created_at_fr' => $q->created_at?->locale('fr_FR')->isoFormat('D MMM YYYY HH[h]mm'),
                'customer' => [
                    'full_name' => $q->customer?->full_name,
                    'company_name' => $q->customer?->company_name,
                    'phone' => $q->customer?->phone,
                    'email' => $q->customer?->email,
                ],
                'items_count' => $q->items()->count(),
                'items_total' => (float) $q->items()->sum('total_price'),
                'items_total_formatted' => $this->formatGnf((float) $q->items()->sum('total_price')),
            ]);
    }

    private function buildRecentContacts(int $limit = 8)
    {
        return Contact::orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'subject' => $c->subject,
                'created_at' => $c->created_at?->toISOString(),
                'created_at_fr' => $c->created_at?->locale('fr_FR')->isoFormat('D MMM YYYY HH[h]mm'),
            ]);
    }

    // ————————————————————————————————————————————————————————————————————————
    // Helpers
    // ————————————————————————————————————————————————————————————————————————

    private function formatGnf(float $amount): string
    {
        return number_format($amount, 0, ',', ' ').' GNF';
    }

    /**
     * Agrège la somme de order_items.total_price pour un query Order donnée
     * (JOIN simple entre orders et order_items). On retourne 0 si rien.
     */
    private function sumOrderItemsTotal(\Illuminate\Database\Eloquent\Builder $orderQuery): float
    {
        try {
            $row = (clone $orderQuery)
                ->join('order_items', 'order_items.order_id', '=', 'orders.id')
                ->selectRaw('COALESCE(SUM(order_items.total_price), 0) AS total_sum')
                ->first();

            return (float) ($row?->total_sum ?? 0);
        } catch (\Throwable) {
            return 0;
        }
    }
}
