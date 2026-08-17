<?php

namespace App\Modules\ERP\Controllers;

use App\Events\SendMessageEvent;
use App\Http\Controllers\Controller;
use App\Modules\ERP\Mail\AdminOrderCreated;
use App\Modules\ERP\Mail\CustomerOrderCreated;
use App\Modules\ERP\Mail\CustomerOrderStatusChanged;
use App\Modules\ERP\Models\Customer;
use App\Modules\ERP\Models\Order;
use App\Modules\ERP\Requests\OrderRequest;
use App\Modules\ERP\Requests\OrderUpdateRequest;
use App\Modules\ERP\Resources\OrderResource;
use App\Modules\Management\Models\Product;
use App\Traits\ApiResponses;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    use ApiResponses;

    // ————————————————————————————————————————————————————————————————————————
    // Admin: list & show
    // ————————————————————————————————————————————————————————————————————————

    public function index()
    {
        $orders = Order::with(['customer', 'items'])
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse(
            OrderResource::collection($orders),
            'Commandes chargées avec succès'
        );
    }

    public function show(Order $order)
    {
        // Admin opens a 'new' order → auto-switch to 'pending' (pas de notif client)
        if ($order->status === 'new') {
            $order->update(['status' => 'pending']);
        }

        return $this->successResponse(
            new OrderResource($order->load(['customer', 'items'])),
            'Commande chargée avec succès'
        );
    }

    // ————————————————————————————————————————————————————————————————————————
    // Public + Admin: create an order
    // ————————————————————————————————————————————————————————————————————————

    public function store(OrderRequest $request)
    {
        $data = $request->validated();

        $result = DB::transaction(function () use ($data, $request) {
            $customer = $request->matchedCustomer();

            if (! $customer) {
                $customer = Customer::create([
                    'full_name' => $data['full_name'],
                    'company_name' => $data['company_name'] ?? null,
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                ]);
            }

            $initialStatus = $data['status'] ?? 'new';

            $order = Order::create([
                'reference' => $this->generateReference(),
                'customer_id' => $customer->id,
                'status' => $initialStatus,
                'delivery_mode' => $data['delivery_mode'],
                'comment' => $data['comment'] ?? null,
                'internal_notes' => $data['internal_notes'] ?? null,
            ]);

            $itemsTotal = 0;

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];
                $priceSnapshot = (float) ($product->price ?? 0);
                $totalPrice = round($priceSnapshot * $quantity, 2);

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'product_name_snapshot' => $product->name,
                    'product_unit_snapshot' => $product->unit ?? '',
                    'price_snapshot' => $priceSnapshot,
                    'total_price' => $totalPrice,
                ]);

                $itemsTotal += $totalPrice;
            }

            $createdDateFr = Carbon::parse($order->created_at)->locale('fr_FR')->isoFormat('D MMMM YYYY [à] HH[h]mm');
            $itemsCount = count($data['items']);
            $isPublic = ! Auth::check();

            $emailCustomerSent = false;
            $emailAdminSent = false;

            if ($order) {
                try {
                    SendMessageEvent::dispatch(
                        $customer->phone,
                        "Bonjour {$customer->full_name}, votre commande {$order->reference} ({$itemsCount} article(s), {$this->formatGnf($itemsTotal)}) a bien été enregistrée. Notre équipe vous contacte sous 24 h ouvrées. Sincery Prestations."
                    );
                } catch (\Throwable) {
                }

                try {
                    Mail::to($customer->email, $customer->full_name)
                        ->queue(new CustomerOrderCreated($order, $createdDateFr, $itemsTotal, $itemsCount));
                    $emailCustomerSent = true;
                } catch (\Throwable) {
                    $emailCustomerSent = false;
                }

                try {
                    Mail::queue(new AdminOrderCreated($order, $createdDateFr, $itemsTotal, $itemsCount));
                    $emailAdminSent = true;
                } catch (\Throwable) {
                    $emailAdminSent = false;
                }
            }

            return [
                'order' => $order,
                'email_customer_sent' => $emailCustomerSent,
                'email_admin_sent' => $emailAdminSent,
                'is_public' => $isPublic,
                'created_date_fr' => $createdDateFr,
            ];
        });

        $order = $result['order']->load(['customer', 'items']);

        $statusCode = 201;
        $message = $result['is_public']
            ? 'Commande enregistrée avec succès. Un e-mail et un SMS de confirmation vous ont été envoyés.'
            : 'Commande créée avec succès.';

        if (! $result['email_customer_sent'] || ! $result['email_admin_sent']) {
            $statusCode = 202;
            $message .= ' Attention : échec de l\'envoi d\'un ou plusieurs e-mails (SMTP indisponible). Le client et l\'équipe commerciale devront être prévenus manuellement.';
        }

        return $this->successResponse(
            [
                'order' => new OrderResource($order),
                'email_customer_sent' => $result['email_customer_sent'],
                'email_admin_sent' => $result['email_admin_sent'],
                'created_date_fr' => $result['created_date_fr'],
            ],
            $message,
            $statusCode,
        );
    }

    // ————————————————————————————————————————————————————————————————————————
    // Admin: general update
    // ————————————————————————————————————————————————————————————————————————

    public function update(OrderUpdateRequest $request, Order $order)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $order) {
            $fields = [
                'delivery_mode' => $data['delivery_mode'] ?? $order->delivery_mode,
                'comment' => array_key_exists('comment', $data) ? ($data['comment'] ?? null) : $order->comment,
                'internal_notes' => array_key_exists('internal_notes', $data) ? ($data['internal_notes'] ?? null) : $order->internal_notes,
            ];

            if (isset($data['status'])) {
                $fields['status'] = $data['status'];
            }

            $order->update($fields);

            if (isset($data['items'])) {
                $submittedIds = collect($data['items'])->pluck('id')->filter()->values();

                $order->items()->whereNotIn('id', $submittedIds)->delete();

                foreach ($data['items'] as $itemData) {
                    if (! empty($itemData['id'])) {
                        $item = $order->items()->find($itemData['id']);
                        if (! $item) {
                            continue;
                        }

                        $quantity = $itemData['quantity'];
                        if (isset($itemData['price'])) {
                            $price = (float) $itemData['price'];
                        } else {
                            $product = $item->product;
                            $price = (float) ($product?->price ?? $item->price_snapshot);
                        }

                        $item->update([
                            'quantity' => $quantity,
                            'price_snapshot' => $price,
                            'total_price' => round($price * $quantity, 2),
                        ]);
                    } else {
                        $product = Product::findOrFail($itemData['product_id']);
                        $quantity = $itemData['quantity'];
                        $price = isset($itemData['price']) ? (float) $itemData['price'] : (float) ($product->price ?? 0);

                        $order->items()->create([
                            'product_id' => $product->id,
                            'quantity' => $quantity,
                            'product_name_snapshot' => $product->name,
                            'product_unit_snapshot' => $product->unit ?? '',
                            'price_snapshot' => $price,
                            'total_price' => round($price * $quantity, 2),
                        ]);
                    }
                }
            }
        });

        return $this->successResponse(
            new OrderResource($order->fresh()->load(['customer', 'items'])),
            'Commande mise à jour avec succès'
        );
    }

    // ————————————————————————————————————————————————————————————————————————
    // Admin: status transition endpoints (with notifications)
    // ————————————————————————————————————————————————————————————————————————

    public function confirm(Order $order)
    {
        if (! in_array($order->status, ['new', 'pending'], true)) {
            return $this->errorResponse(
                'Seule une commande nouvelle ou en cours peut être confirmée (statut actuel : ' . $order->status . ').',
                [],
                422,
            );
        }

        $order->update(['status' => 'confirmed']);
        $order->load(['customer', 'items']);

        $statusFr = 'Confirmée';
        $statusDateFr = now()->locale('fr_FR')->isoFormat('D MMMM YYYY [à] HH[h]mm');

        $customIntro = null;
        $sms = null;

        if ($order->delivery_mode === 'Livraison') {
            $customIntro = 'Votre commande est validée, la livraison est en préparation. Notre transporteur vous contactera sous peu pour convenir du rendez-vous.';
            $sms = "Bonjour {$order->customer->full_name}, votre commande {$order->reference} est confirmée. Livraison en cours de préparation — notre transporteur vous appelle sous peu. Sincery Prestations.";
        } else {
            $customIntro = 'Votre commande est confirmée et est en cours de préparation à la boutique. Un SMS vous sera envoyé dès qu\'elle sera prête à être retirée.';
            $sms = "Bonjour {$order->customer->full_name}, votre commande {$order->reference} est confirmée et en préparation à la boutique (retrait). Un SMS vous avertira dès qu'elle est prête. Sincery Prestations.";
        }

        $this->notifyStatusChanged($order, $statusFr, $statusDateFr, $customIntro, $sms);

        return $this->successResponse(
            new OrderResource($order),
            'Commande confirmée avec succès — client notifié par e-mail et SMS.'
        );
    }

    public function deliver(Order $order)
    {
        if ($order->status !== 'confirmed') {
            return $this->errorResponse(
                'Seule une commande confirmée peut être marquée comme livrée / retirée (statut actuel : ' . $order->status . ').',
                [],
                422,
            );
        }

        $order->update(['status' => 'delivered']);
        $order->load(['customer', 'items']);

        $statusFr = 'Livrée / Retirée';
        $statusDateFr = now()->locale('fr_FR')->isoFormat('D MMMM YYYY [à] HH[h]mm');

        if ($order->delivery_mode === 'Livraison') {
            $customIntro = 'Votre commande est marquée comme ayant été livrée. Merci de votre confiance — n\'hésitez pas à nous laisser un retour sur la qualité des produits et du service.';
            $sms = "Bonjour {$order->customer->full_name}, votre commande {$order->reference} a été livrée. Merci pour votre confiance ! Sincery Prestations.";
        } else {
            $customIntro = 'Votre commande est marquée comme ayant été retirée à la boutique. Merci de votre confiance — n\'hésitez pas à nous contacter pour toute question ou retour produit.';
            $sms = "Bonjour {$order->customer->full_name}, retrait de votre commande {$order->reference} enregistré. Merci pour votre confiance ! Sincery Prestations.";
        }

        $this->notifyStatusChanged($order, $statusFr, $statusDateFr, $customIntro, $sms);

        return $this->successResponse(
            new OrderResource($order),
            'Commande marquée comme livrée / retirée — client notifié.'
        );
    }

    public function cancel(Order $order)
    {
        if ($order->status === 'delivered') {
            return $this->errorResponse(
                'Une commande déjà livrée / retirée ne peut pas être annulée. Utilisez plutôt une note interne.',
                [],
                422,
            );
        }

        if (! in_array($order->status, ['new', 'pending', 'confirmed'], true)) {
            return $this->errorResponse(
                'Statut invalide pour annulation (statut actuel : ' . $order->status . ').',
                [],
                422,
            );
        }

        $order->update(['status' => 'canceled']);
        $order->load(['customer', 'items']);

        $statusFr = 'Annulée';
        $statusDateFr = now()->locale('fr_FR')->isoFormat('D MMMM YYYY [à] HH[h]mm');
        $customIntro = 'Votre commande a été annulée. Si cette annulation est le fait de notre équipe, un conseiller prendra contact avec vous dans les plus brefs délais pour vous proposer une solution adaptée.';
        $sms = "Bonjour {$order->customer->full_name}, votre commande {$order->reference} a été annulée. Pour toute question, contactez Sincery Prestations.";

        $this->notifyStatusChanged($order, $statusFr, $statusDateFr, $customIntro, $sms);

        return $this->successResponse(
            new OrderResource($order),
            'Commande annulée — client notifié par e-mail et SMS.'
        );
    }

    // ————————————————————————————————————————————————————————————————————————
    // Admin: delete (cleanup)
    // ————————————————————————————————————————————————————————————————————————

    public function destroy(Order $order)
    {
        $order->delete();

        return $this->successResponse(null, 'Commande supprimée avec succès');
    }

    // ————————————————————————————————————————————————————————————————————————
    // Internal helpers
    // ————————————————————————————————————————————————————————————————————————

    /**
     * Envoie (en queue) l'e-mail + SMS de changement de statut au client.
     * Les échecs sont loggés mais non bloquants pour la réponse HTTP.
     */
    private function notifyStatusChanged(
        Order $order,
        string $statusFr,
        string $statusDateFr,
        ?string $customIntro,
        ?string $sms,
    ): void {
        try {
            Mail::to($order->customer->email, $order->customer->full_name)
                ->queue(new CustomerOrderStatusChanged($order, $statusFr, $statusDateFr, $customIntro));
        } catch (\Throwable $e) {
            report($e);
        }

        if ($sms) {
            try {
                SendMessageEvent::dispatch($order->customer->phone, $sms);
            } catch (\Throwable) {
            }
        }
    }

    private function formatGnf(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' GNF';
    }

    private function generateReference(): string
    {
        $prefix = 'CMD-' . now()->year . '-';

        $lastReference = Order::where('reference', 'like', "{$prefix}%")
            ->lockForUpdate()
            ->orderByDesc('reference')
            ->value('reference');

        $nextNumber = $lastReference
            ? ((int) substr($lastReference, strlen($prefix))) + 1
            : 1;

        return $prefix . sprintf('%04d', $nextNumber);
    }
}
