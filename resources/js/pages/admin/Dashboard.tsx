import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  PackageIcon,
  BoxesIcon,
  FileTextIcon,
  MailIcon,
  NewspaperIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge, type Tone } from '../../components/ui/StatusBadge';
import {
  SkeletonKpiCard,
  SkeletonTable,
  Skeleton,
} from '../../components/admin/ui/Skeleton';
import { KpiSparkline } from '../../components/admin/ui/KpiSparkline';
import { api } from '../../lib/api';
import type { DashboardStats, OrderStatus } from '../../types/admin';
import { formatPrice, formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

const orderStatusToneMap: Record<OrderStatus, Tone> = {
  new: 'info',
  pending: 'warning',
  confirmed: 'success',
  delivered: 'success',
  canceled: 'danger',
};

const pieChartColors: Record<string, string> = {
  new: '#3B82F6',
  pending: '#F59E0B',
  confirmed: '#10B981',
  delivered: '#047857',
  canceled: '#B91C1C',
};

export function Dashboard() {
  useSeo(
    'Tableau de bord | Administration Sincery Prestations',
    "Vue d'ensemble de l'activité : produits, chiffre d'affaires, commandes, devis, messages et actualités."
  );

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<DashboardStats>('/v1/admin/stats/dashboard');
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      toast.error('Erreur lors du chargement des statistiques.', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const todayStr = new Date().toISOString();
  const generatedAt = stats?.generated_at ?? todayStr;
  const descriptionDate = formatShortDate(generatedAt);

  const last6Revenue = stats?.monthly_revenue.slice(-6) ?? [];
  const sparkRevenue = last6Revenue.map((m) => m.revenue_confirmed);
  const sparkOrders = last6Revenue.map((m) => m.orders_count);
  const quoteSparkData =
    stats?.quote_monthly_counts.slice(-6).map((m) => m.new + m.priced + m.approved) ??
    [];
  const flatSpark = [0, 0, 0, 0, 0, 0];

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description={`Activité au ${descriptionDate} — Vue d'ensemble des performances et alertes.`}
      />

      {error && !loading && (
        <AdminCard className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-bg">
                <AlertTriangleIcon className="h-5 w-5 text-danger" aria-hidden />
              </span>
              <div>
                <p className="text-base font-semibold text-black/90">
                  Erreur lors du chargement des statistiques.
                </p>
                <p className="text-sm text-black/65">{error}</p>
              </div>
            </div>
            <Button variant="primary" onClick={() => void fetchStats()}>
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonKpiCard key={i} />)
        ) : stats ? (
          <>
            <Link
              to="/admin/produits"
              className="group rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <PackageIcon className="h-5 w-5" aria-hidden />
                </span>
                <KpiSparkline
                  values={sparkRevenue.length ? sparkRevenue : flatSpark}
                  stroke="#c1272d"
                  height={36}
                  width={100}
                />
              </div>
              <p className="mt-3 text-2xl font-bold text-black/90">
                {stats.kpis.products.value}
              </p>
              <p className="text-sm text-black/65">
                {stats.kpis.products.published} publiés /{' '}
                {stats.kpis.products.unavailable} indisponibles
              </p>
              <div className="mt-3 flex items-center text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Produits <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link
              to="/admin/commandes"
              className="group rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <DollarSignIcon className="h-5 w-5" aria-hidden />
                </span>
                <KpiSparkline
                  values={sparkRevenue.length ? sparkRevenue : flatSpark}
                  stroke="#c1272d"
                  height={36}
                  width={100}
                  deltaPercent={stats.kpis.revenue_month_confirmed.variation_vs_last_month_pct}
                  positiveIsGood
                />
              </div>
              <p className="mt-3 text-2xl font-bold text-black/90">
                {stats.kpis.revenue_month_confirmed.value_formatted}
              </p>
              <p className="text-sm text-black/65">Chiffre d'affaires ce mois</p>
              <div className="mt-3 flex items-center text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Commandes <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link
              to="/admin/commandes"
              className="group rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <BoxesIcon className="h-5 w-5" aria-hidden />
                </span>
                <KpiSparkline
                  values={sparkOrders.length ? sparkOrders : flatSpark}
                  stroke="#c1272d"
                  height={36}
                  width={100}
                />
              </div>
              <p className="mt-3 text-2xl font-bold text-black/90">
                {stats.kpis.orders.value}
              </p>
              <p className="text-sm text-black/65">
                {stats.kpis.orders.pending} en attente ·{' '}
                {stats.kpis.orders.month_count} ce mois
              </p>
              <div className="mt-3 flex items-center text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Commandes <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link
              to="/admin/devis"
              className="group rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <FileTextIcon className="h-5 w-5" aria-hidden />
                </span>
                <KpiSparkline
                  values={quoteSparkData.length ? quoteSparkData : flatSpark}
                  stroke="#c1272d"
                  height={36}
                  width={100}
                />
              </div>
              <p className="mt-3 text-2xl font-bold text-black/90">
                {stats.kpis.quotes.value}
              </p>
              <p className="text-sm text-black/65">
                {stats.kpis.quotes.pending} en attente ·{' '}
                {stats.kpis.quotes.approved} approuvés
              </p>
              <div className="mt-3 flex items-center text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Devis <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link
              to="/admin/messages"
              className="group rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <MailIcon className="h-5 w-5" aria-hidden />
                </span>
                <KpiSparkline
                  values={flatSpark}
                  stroke="#c1272d"
                  height={36}
                  width={100}
                />
              </div>
              <p className="mt-3 text-2xl font-bold text-black/90">
                {stats.kpis.contacts.value}
              </p>
              <p className="text-sm text-black/65">
                {stats.kpis.contacts.new_7d} nouveaux (7 j)
              </p>
              <div className="mt-3 flex items-center text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Messages <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link
              to="/admin/actualites"
              className="group rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <NewspaperIcon className="h-5 w-5" aria-hidden />
                </span>
                <KpiSparkline
                  values={flatSpark}
                  stroke="#c1272d"
                  height={36}
                  width={100}
                />
              </div>
              <p className="mt-3 text-2xl font-bold text-black/90">
                {stats.kpis.posts.value}
              </p>
              <p className="text-sm text-black/65">
                {stats.kpis.posts.published} publiés
              </p>
              <div className="mt-3 flex items-center text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Actualités <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <div className="rounded-lg border border-line bg-white p-4 shadow-card">
              <Skeleton className="mb-4 h-5 w-64" />
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </div>
            <div className="rounded-lg border border-line bg-white p-4 shadow-card">
              <Skeleton className="mb-4 h-5 w-64" />
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </div>
          </>
        ) : stats ? (
          <>
            <AdminCard>
              <div className="border-b border-line px-4 py-3">
                <h2 className="text-lg font-semibold text-black/90">
                  Revenus mensuels (12 derniers mois)
                </h2>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={stats.monthly_revenue}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="month_label"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const numeric = typeof value === 'undefined' ? 0 : Number(value);
                        if (name === 'revenue_confirmed') {
                          return [formatPrice(numeric), "Chiffre d'affaires confirmé"];
                        }
                        return [numeric, 'Nombre de devis'];
                      }}
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend
                      formatter={(value: string) => {
                        if (value === 'revenue_confirmed')
                          return "Chiffre d'affaires confirmé";
                        if (value === 'quotes_count') return 'Nombre de devis';
                        return value;
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue_confirmed"
                      fill="#c1272d"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quotes_count"
                      stroke="#64748b"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#64748b' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="border-b border-line px-4 py-3">
                <h2 className="text-lg font-semibold text-black/90">
                  Répartition des commandes par statut
                </h2>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={stats.order_status_breakdown.items}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="label"
                      label={(entry: unknown) => {
                        const e = entry as { label?: string; count?: number; name?: string; value?: number };
                        const label = e.label ?? e.name ?? '';
                        const count = e.count ?? e.value ?? 0;
                        return `${label}: ${count}`;
                      }}
                      labelLine={false}
                    >
                      {stats.order_status_breakdown.items.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieChartColors[entry.status] ?? '#9ca3af'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, props) => {
                        const numeric = typeof value === 'undefined' ? 0 : Number(value);
                        const payload = (props as { payload?: { pct?: number; label?: string } } | undefined)?.payload;
                        const pct = payload?.pct ?? 0;
                        const label = payload?.label ?? _name ?? '';
                        return [`${numeric} (${pct.toFixed(1)}%)`, label];
                      }}
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: unknown) => {
                        const p = entry as { payload?: { count: number; pct: number } };
                        const count = p.payload?.count ?? 0;
                        const pct = p.payload?.pct ?? 0;
                        return `${value} · ${count} (${pct.toFixed(0)}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AdminCard>
          </>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <AdminCard>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg font-semibold text-black/90">
              Produits en stock faible
            </h2>
            <Link
              to="/admin/produits"
              className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Tout voir <ChevronRightIcon className="ml-0.5 h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <SkeletonTable rows={6} columns={3} />
          ) : stats ? (
            stats.low_stock_products.length > 0 ? (
              <ul className="divide-y divide-line">
                {stats.low_stock_products.slice(0, 8).map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-black/90">
                        {product.name}
                      </p>
                      <p className="truncate text-sm text-black/65">
                        Réf. <span className="font-semibold">{product.reference}</span>
                      </p>
                    </div>
                    <StatusBadge tone={product.status_tone}>
                      {product.status_label}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-black/55">
                Aucun produit en stock faible actuellement.
              </div>
            )
          ) : null}
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg font-semibold text-black/90">
              Dernières commandes
            </h2>
            <Link
              to="/admin/commandes"
              className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Tout voir <ChevronRightIcon className="ml-0.5 h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <SkeletonTable rows={6} columns={5} />
          ) : stats ? (
            <ul className="divide-y divide-line">
              {stats.recent_orders.slice(0, 6).map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-black/90">
                      {order.reference}
                    </p>
                    <p className="truncate text-sm text-black/65">
                      {order.customer.full_name}
                      {order.customer.company_name
                        ? ` · ${order.customer.company_name}`
                        : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-black/45">
                      {order.created_at_fr}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-bold text-brand">
                      {order.items_total_formatted}
                    </span>
                    <StatusBadge tone={orderStatusToneMap[order.status]}>
                      {order.status === 'new'
                        ? 'Nouvelle'
                        : order.status === 'pending'
                          ? 'En attente'
                          : order.status === 'confirmed'
                            ? 'Confirmée'
                            : order.status === 'delivered'
                              ? 'Livrée'
                              : 'Annulée'}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg font-semibold text-black/90">
              Derniers messages
            </h2>
            <Link
              to="/admin/messages"
              className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Tout voir <ChevronRightIcon className="ml-0.5 h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <SkeletonTable rows={6} columns={3} />
          ) : stats ? (
            <ul className="divide-y divide-line">
              {stats.recent_contacts.slice(0, 6).map((contact) => (
                <li key={contact.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-base font-semibold text-black/90">
                      {contact.subject}
                    </p>
                    <span className="shrink-0 text-xs text-black/45">
                      {contact.created_at_fr}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-black/65">
                    {contact.name} · {contact.email}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </AdminCard>
      </div>
    </>
  );
}
