import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  EyeIcon,
  RefreshCwIcon,
  TruckIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useSeo } from '../../utils/seo';
import { formatShortDate } from '../../utils/format';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, type DataTableColumn } from '../../components/admin/ui/DataTable';
import { Tabs, type TabItem } from '../../components/admin/ui/Tabs';
import { Drawer } from '../../components/admin/ui/Drawer';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { StatusBadge, type Tone } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { OrderUpdatePanel } from '../../components/forms/admin/OrderUpdatePanel';
import type { AdminOrder, OrderStatus, OrderDeliveryMode, Product } from '../../types/admin';

const orderStatusLabels: Record<OrderStatus, string> = {
  new: 'Nouvelle',
  pending: 'En attente',
  confirmed: 'Confirmée',
  delivered: 'Livrée',
  canceled: 'Annulée',
};

const orderStatusTones: Record<OrderStatus, Tone> = {
  new: 'info',
  pending: 'warning',
  confirmed: 'success',
  delivered: 'success',
  canceled: 'danger',
};

type TabValue = 'all' | OrderStatus;

function formatGnf(value: number | null | undefined): string {
  const v = Number(value) || 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    maximumFractionDigits: 0,
  }).format(v);
}

export function AdminOrders() {
  useSeo(
    'Commandes | Administration Sincery Prestations',
    'Suivi des commandes enregistrées sans paiement en ligne : statuts, détails clients et notes internes.'
  );

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabValue>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    kind: 'confirm' | 'deliver' | 'cancel' | 'delete';
    order: AdminOrder;
  }>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<AdminOrder[]>('/v1/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.get<Product[]>('/v1/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      /* products optional — fallback to empty */
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    void fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const counts = useMemo(() => {
    const c: Record<OrderStatus, number> = {
      new: 0,
      pending: 0,
      confirmed: 0,
      delivered: 0,
      canceled: 0,
    };
    orders.forEach((o) => {
      c[o.status] += 1;
    });
    return c;
  }, [orders]);

  const tabs: TabItem<TabValue>[] = [
    { value: 'all', label: 'Toutes', count: orders.length },
    { value: 'new', label: orderStatusLabels.new, count: counts.new, tone: 'info' },
    { value: 'pending', label: orderStatusLabels.pending, count: counts.pending, tone: 'warning' },
    { value: 'confirmed', label: orderStatusLabels.confirmed, count: counts.confirmed, tone: 'success' },
    { value: 'delivered', label: orderStatusLabels.delivered, count: counts.delivered, tone: 'success' },
    { value: 'canceled', label: orderStatusLabels.canceled, count: counts.canceled, tone: 'danger' },
  ];

  const visibleOrders = useMemo(() => {
    if (tab === 'all') return orders;
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  async function openDrawer(order: AdminOrder) {
    setSelected(order);
    setDrawerOpen(true);
    if (!order.items || order.items.length === 0) {
      setDrawerLoading(true);
      try {
        const full = await api.get<AdminOrder>(`/v1/orders/${order.id}`);
        setSelected(full);
      } catch (e) {
        toast.error('Impossible de charger le détail de la commande');
      } finally {
        setDrawerLoading(false);
      }
    }
  }

  async function handleUpdate(values: {
    status: OrderStatus;
    delivery_mode: OrderDeliveryMode;
    comment: string | null;
    internal_notes: string | null;
    items: Array<{ id: number; product_id: number | null; product_name: string; quantity: number; price: number | null }>;
  }) {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.put(`/v1/orders/${selected.id}`, values);
      toast.success('Commande mise à jour', {
        description: `Les modifications de ${selected.reference} ont été enregistrées.`,
      });
      setDrawerOpen(false);
      await fetchOrders();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Mise à jour échouée', { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  async function runConfirmAction() {
    if (!confirmAction) return;
    const { kind, order } = confirmAction;
    setSubmitting(true);
    try {
      if (kind === 'confirm') {
        await api.post(`/v1/orders/${order.id}/confirm`);
        toast.success('Commande confirmée', { description: order.reference });
      } else if (kind === 'deliver') {
        await api.post(`/v1/orders/${order.id}/deliver`);
        toast.success('Commande marquée livrée', { description: order.reference });
      } else if (kind === 'cancel') {
        await api.post(`/v1/orders/${order.id}/cancel`);
        toast.success('Commande annulée', { description: order.reference });
      } else if (kind === 'delete') {
        await api.delete(`/v1/orders/${order.id}`);
        toast.success('Commande supprimée', { description: order.reference });
      }
      setConfirmAction(null);
      await fetchOrders();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Action échouée', { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const columns: DataTableColumn<AdminOrder>[] = [
    {
      key: 'reference',
      header: 'Référence',
      render: (row) => (
        <span className="font-semibold text-black/90">{row.reference}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Client',
      render: (row) => (
        <div>
          <div className="font-medium text-black/90">{row.customer.full_name}</div>
          {row.customer.company_name && (
            <div className="text-sm text-black/50">{row.customer.company_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'items_total',
      header: 'Total',
      className: 'text-right',
      headerClassName: 'text-right',
      hideBelow: 'sm',
      render: (row) => (
        <span className="font-bold text-brand tabular-nums">
          {formatGnf(row.items_total ?? 0)}
        </span>
      ),
    },
    {
      key: 'items_count',
      header: 'Articles',
      className: 'text-center',
      headerClassName: 'text-center',
      hideBelow: 'sm',
      render: (row) => (
        <span className="tabular-nums">{row.items_count ?? row.items?.length ?? 0}</span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (row) => (
        <StatusBadge tone={orderStatusTones[row.status]}>
          {row.status_label ?? orderStatusLabels[row.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      hideBelow: 'md',
      render: (row) => (
        <span className="text-black/65 tabular-nums">
          {row.created_at ? formatShortDate(row.created_at) : '—'}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <AdminPageHeader
        title="Commandes"
        description="Commandes enregistrées via le site, sans paiement en ligne."
      />

      {error && (
        <AdminCard className="mb-4 border-danger/40 bg-danger-bg/50">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
              <div>
                <p className="font-semibold text-danger">Erreur de chargement</p>
                <p className="text-sm text-black/65">{error}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RefreshCwIcon className="h-4 w-4" aria-hidden />}
              onClick={() => void fetchOrders()}
            >
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      <div className="mb-4">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
      </div>

      <DataTable
        columns={columns}
        rows={visibleOrders}
        loading={loading}
        emptyTitle="Aucune commande"
        emptyHint={tab === 'all' ? 'Aucune commande enregistrée pour le moment.' : `Aucune commande avec le statut « ${orderStatusLabels[tab as OrderStatus] ?? tab} ».`}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<EyeIcon className="h-4 w-4" aria-hidden />}
              onClick={() => void openDrawer(row)}
            >
              Voir
            </Button>
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                iconRight={<ChevronDownIcon className="h-4 w-4" aria-hidden />}
              >
                Actions
              </Button>
              <div className="mt-2 hidden min-w-[180px] divide-y divide-line rounded-md border border-line bg-white p-1 shadow-elevated group-hover:block right-0 absolute z-30 sm:group-hover:block">
                {row.can_confirm && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-success hover:bg-success-bg"
                    onClick={() => setConfirmAction({ kind: 'confirm', order: row })}
                  >
                    <CheckCircle2Icon className="h-4 w-4" aria-hidden />
                    Confirmer
                  </button>
                )}
                {row.can_deliver && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-info hover:bg-info-bg"
                    onClick={() => setConfirmAction({ kind: 'deliver', order: row })}
                  >
                    <TruckIcon className="h-4 w-4" aria-hidden />
                    Marquer livrée
                  </button>
                )}
                {row.can_cancel && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-warning hover:bg-warning-bg"
                    onClick={() => setConfirmAction({ kind: 'cancel', order: row })}
                  >
                    <XCircleIcon className="h-4 w-4" aria-hidden />
                    Annuler
                  </button>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                  onClick={() => setConfirmAction({ kind: 'delete', order: row })}
                >
                  <XIcon className="h-4 w-4" aria-hidden />
                  Supprimer
                </button>
              </div>
            </div>
          </>
        )}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => !submitting && setDrawerOpen(false)}
        size="lg"
        title={selected ? `Commande ${selected.reference}` : 'Commande'}
        description={
          selected
            ? `Client: ${selected.customer.full_name}${selected.customer.company_name ? ` · ${selected.customer.company_name}` : ''}`
            : undefined
        }
      >
        {!selected || drawerLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-md bg-line"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <OrderUpdatePanel
            order={{
              status: selected.status,
              delivery_mode: selected.delivery_mode,
              comment: selected.comment,
              internal_notes: selected.internal_notes,
              items: (selected.items ?? []).map((it) => ({
                id: it.id,
                product_id: it.product_id,
                product_name: it.product_name,
                quantity: it.quantity,
                price: it.price,
              })),
            }}
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
            }))}
            onSubmit={handleUpdate}
            submitting={submitting}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => !submitting && setConfirmAction(null)}
        onConfirm={runConfirmAction}
        loading={submitting}
        dismissible={!submitting}
        tone={confirmAction?.kind === 'delete' || confirmAction?.kind === 'cancel' ? 'danger' : 'confirm'}
        title={
          confirmAction?.kind === 'confirm'
            ? `Confirmer la commande ${confirmAction.order.reference} ?`
            : confirmAction?.kind === 'deliver'
              ? `Marquer ${confirmAction.order.reference} comme livrée ?`
              : confirmAction?.kind === 'cancel'
                ? `Annuler la commande ${confirmAction.order.reference} ?`
                : confirmAction
                  ? `Supprimer définitivement ${confirmAction.order.reference} ?`
                  : ''
        }
        description={
          confirmAction?.kind === 'delete'
            ? 'Cette action est irréversible. La commande sera supprimée de la base de données.'
            : confirmAction
              ? 'Le client recevra une notification de changement de statut par email.'
              : undefined
        }
        confirmLabel={
          confirmAction?.kind === 'confirm'
            ? 'Confirmer la commande'
            : confirmAction?.kind === 'deliver'
              ? 'Marquer comme livrée'
              : confirmAction?.kind === 'cancel'
                ? 'Annuler la commande'
                : 'Supprimer'
        }
      >
        {confirmAction && (
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-black/50">Client:</span>{' '}
              <span className="font-medium text-black/85">{confirmAction.order.customer.full_name}</span>
            </div>
            <div>
              <span className="text-black/50">Total:</span>{' '}
              <span className="font-bold text-brand">
                {formatGnf(confirmAction.order.items_total ?? 0)}
              </span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </motion.div>
  );
}
