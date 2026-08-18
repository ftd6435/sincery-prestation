import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  EyeIcon,
  MoreVerticalIcon,
  RefreshCwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
  XCircleIcon,
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
import { QuotePricingPanel, type QuotePricingFormValues } from '../../components/forms/admin/QuotePricingPanel';
import type { QuoteRequest, QuoteRequestStatus } from '../../types/admin';

const quoteStatusLabels: Record<QuoteRequestStatus, string> = {
  new: 'En attente',
  priced: 'Tarifié',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  expired: 'Expiré',
};

const quoteStatusTones: Record<QuoteRequestStatus, Tone> = {
  new: 'warning',
  priced: 'info',
  approved: 'success',
  rejected: 'danger',
  expired: 'neutral',
};

type TabValue = 'all' | QuoteRequestStatus;

function formatGnf(value: number | null | undefined): string {
  const v = Number(value) || 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    maximumFractionDigits: 0,
  }).format(v);
}

export function AdminQuotes() {
  useSeo(
    'Devis | Administration Sincery Prestations',
    'Suivi des demandes de devis : statuts, détail des produits demandés et tarification.'
  );

  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabValue>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    kind: 'approve' | 'reject' | 'delete';
    quote: QuoteRequest;
  }>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<QuoteRequest[]>('/v1/quote-requests');
      setQuotes(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    if (openMenuId === null) return;
    function onDocClick() {
      setOpenMenuId(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenuId(null);
    }
    window.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [openMenuId]);

  const counts = useMemo(() => {
    const c: Record<QuoteRequestStatus, number> = {
      new: 0,
      priced: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    };
    quotes.forEach((q) => {
      c[q.status] += 1;
    });
    return c;
  }, [quotes]);

  const tabs: TabItem<TabValue>[] = [
    { value: 'all', label: 'Toutes', count: quotes.length },
    { value: 'new', label: quoteStatusLabels.new, count: counts.new, tone: 'warning' },
    { value: 'priced', label: quoteStatusLabels.priced, count: counts.priced, tone: 'info' },
    { value: 'approved', label: quoteStatusLabels.approved, count: counts.approved, tone: 'success' },
    { value: 'rejected', label: quoteStatusLabels.rejected, count: counts.rejected, tone: 'danger' },
    { value: 'expired', label: quoteStatusLabels.expired, count: counts.expired, tone: 'warning' },
  ];

  const visibleQuotes = useMemo(() => {
    if (tab === 'all') return quotes;
    return quotes.filter((q) => q.status === tab);
  }, [quotes, tab]);

  async function openDrawer(quote: QuoteRequest) {
    setSelected(quote);
    setDrawerOpen(true);
    if (!quote.items || quote.items.length === 0) {
      setDrawerLoading(true);
      try {
        const full = await api.get<QuoteRequest>(`/v1/quote-requests/${quote.id}`);
        setSelected(full);
      } catch {
        toast.error('Impossible de charger le détail du devis');
      } finally {
        setDrawerLoading(false);
      }
    }
  }

  async function handleSetPricing(values: QuotePricingFormValues) {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.post(`/v1/quote-requests/${selected.id}/set-pricing`, values);
      toast.success('Tarification enregistrée', {
        description: `Le devis ${selected.reference} a été tarifé.`,
      });
      setDrawerOpen(false);
      await fetchQuotes();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Tarification échouée', { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  async function runConfirmAction() {
    if (!confirmAction) return;
    const { kind, quote } = confirmAction;
    setSubmitting(true);
    try {
      if (kind === 'approve') {
        await api.post(`/v1/quote-requests/${quote.id}/approve`);
        toast.success('Devis approuvé', { description: quote.reference });
      } else if (kind === 'reject') {
        await api.post(`/v1/quote-requests/${quote.id}/reject`);
        toast.success('Devis rejeté', { description: quote.reference });
      } else if (kind === 'delete') {
        await api.delete(`/v1/quote-requests/${quote.id}`);
        toast.success('Devis supprimé', { description: quote.reference });
      }
      setConfirmAction(null);
      await fetchQuotes();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Action échouée', { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const columns: DataTableColumn<QuoteRequest>[] = [
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
      header: 'Articles (HT)',
      className: 'text-right',
      headerClassName: 'text-right',
      hideBelow: 'sm',
      render: (row) => (
        <span className="tabular-nums text-black/80">
          {formatGnf(row.items_total ?? 0)}
        </span>
      ),
    },
    {
      key: 'items_count',
      header: 'Nb articles',
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
        <StatusBadge tone={quoteStatusTones[row.status]}>
          {row.status_label ?? quoteStatusLabels[row.status]}
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
        title="Demandes de devis"
        description="Traitez les demandes reçues et définissez la tarification."
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
              onClick={() => void fetchQuotes()}
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
        rows={visibleQuotes}
        loading={loading}
        emptyTitle="Aucune demande de devis"
        emptyHint={tab === 'all' ? 'Aucune demande reçue pour le moment.' : `Aucune demande avec le statut « ${quoteStatusLabels[tab as QuoteRequestStatus] ?? tab} ».`}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<EyeIcon className="h-4 w-4" aria-hidden />}
              onClick={() => void openDrawer(row)}
            >
              Tarifer
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Actions pour ${row.reference}`}
                aria-haspopup="menu"
                aria-expanded={openMenuId === row.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === row.id ? null : (row.id as number));
                }}
              >
                <MoreVerticalIcon className="h-4 w-4" aria-hidden />
              </Button>
              {openMenuId === row.id && (
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-1 w-48 divide-y divide-line rounded-md border border-line bg-white p-1 shadow-elevated"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.can_approve && (
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-success hover:bg-success-bg"
                      onClick={() => {
                        setOpenMenuId(null);
                        setConfirmAction({ kind: 'approve', quote: row });
                      }}
                    >
                      <ThumbsUpIcon className="h-4 w-4" aria-hidden />
                      Approuver
                    </button>
                  )}
                  {row.can_reject && (
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-warning hover:bg-warning-bg"
                      onClick={() => {
                        setOpenMenuId(null);
                        setConfirmAction({ kind: 'reject', quote: row });
                      }}
                    >
                      <ThumbsDownIcon className="h-4 w-4" aria-hidden />
                      Rejeter
                    </button>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                    onClick={() => {
                      setOpenMenuId(null);
                      setConfirmAction({ kind: 'delete', quote: row });
                    }}
                  >
                    <Trash2Icon className="h-4 w-4" aria-hidden />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => !submitting && setDrawerOpen(false)}
        size="xl"
        title={selected ? `Devis ${selected.reference}` : 'Devis'}
        description={
          selected
            ? `Client: ${selected.customer.full_name}${selected.customer.company_name ? ` · ${selected.customer.company_name}` : ''}`
            : undefined
        }
      >
        {!selected || drawerLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-md bg-line"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminCard className="p-4">
                <p className="text-xs uppercase tracking-wide text-black/45">Statut</p>
                <div className="mt-2">
                  <StatusBadge tone={quoteStatusTones[selected.status]}>
                    {selected.status_label ?? quoteStatusLabels[selected.status]}
                  </StatusBadge>
                </div>
              </AdminCard>
              <AdminCard className="p-4">
                <p className="text-xs uppercase tracking-wide text-black/45">Date de création</p>
                <p className="mt-2 font-semibold text-black/85 tabular-nums">
                  {selected.created_at ? formatShortDate(selected.created_at) : '—'}
                </p>
              </AdminCard>
              <AdminCard className="p-4">
                <p className="text-xs uppercase tracking-wide text-black/45">Validité</p>
                <p className="mt-2 font-semibold text-black/85 tabular-nums">
                  {selected.validity_date ? formatShortDate(selected.validity_date) : 'À définir'}
                </p>
              </AdminCard>
            </div>

            <AdminCard className="p-4">
              <h3 className="text-base font-semibold text-black/90">Informations client</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-black/45">Nom complet</dt>
                  <dd className="mt-1 font-medium text-black/85">{selected.customer.full_name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-black/45">Entreprise</dt>
                  <dd className="mt-1 text-black/70">{selected.customer.company_name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-black/45">Email</dt>
                  <dd className="mt-1 text-black/70">{selected.customer.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-black/45">Téléphone</dt>
                  <dd className="mt-1 text-black/70">{selected.customer.phone ?? '—'}</dd>
                </div>
              </dl>
              {selected.comment && (
                <div className="mt-4 rounded-md bg-surface-page p-3">
                  <p className="text-xs uppercase tracking-wide text-black/45">Commentaire client</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-black/75">{selected.comment}</p>
                </div>
              )}
            </AdminCard>

            {selected.can_set_pricing ? (
              <QuotePricingPanel
                quoteItems={(selected.items ?? []).map((it) => ({
                  id: it.id,
                  product_name: it.product_name,
                  quantity: it.quantity,
                  price: it.price_snapshot ?? it.total_price / (it.quantity || 1),
                }))}
                onSubmitPricing={handleSetPricing}
                submitting={submitting}
              />
            ) : (
              <AdminCard className="p-5">
                <h3 className="text-lg font-semibold text-black/90">Articles du devis</h3>
                <div className="mt-4 overflow-x-auto rounded-md border border-line">
                  <table className="w-full min-w-[520px] text-left">
                    <caption className="sr-only">Articles</caption>
                    <thead className="bg-surface-alt text-sm text-black/65">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-medium">Produit</th>
                        <th scope="col" className="px-4 py-3 font-medium w-28 text-right">Qté</th>
                        {selected.status !== 'new' && (
                          <th scope="col" className="px-4 py-3 font-medium w-44 text-right">Prix unitaire</th>
                        )}
                        <th scope="col" className="px-4 py-3 font-medium w-44 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {(selected.items ?? []).map((it) => {
                        const unit = it.price_snapshot ?? it.total_price / (it.quantity || 1);
                        return (
                          <tr key={it.id}>
                            <td className="px-4 py-3 font-medium text-black/90">{it.product_name}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{it.quantity}</td>
                            {selected.status !== 'new' && (
                              <td className="px-4 py-3 text-right tabular-nums">{formatGnf(unit)}</td>
                            )}
                            <td className="px-4 py-3 text-right font-bold text-brand tabular-nums">
                              {formatGnf(it.total_price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="w-full max-w-xs rounded-md border border-line bg-surface-alt p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/65">Total HT</span>
                      <span className="text-xl font-bold text-brand tabular-nums">
                        {formatGnf(selected.items_total ?? (selected.items ?? []).reduce((s, i) => s + i.total_price, 0))}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 justify-end">
                  {selected.can_approve && (
                    <Button
                      variant="success"
                      size="sm"
                      iconLeft={<ThumbsUpIcon className="h-4 w-4" aria-hidden />}
                      onClick={() => setConfirmAction({ kind: 'approve', quote: selected })}
                    >
                      Approuver
                    </Button>
                  )}
                  {selected.can_reject && (
                    <Button
                      variant="warning"
                      size="sm"
                      iconLeft={<ThumbsDownIcon className="h-4 w-4" aria-hidden />}
                      onClick={() => setConfirmAction({ kind: 'reject', quote: selected })}
                    >
                      Rejeter
                    </Button>
                  )}
                </div>
              </AdminCard>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => !submitting && setConfirmAction(null)}
        onConfirm={runConfirmAction}
        loading={submitting}
        dismissible={!submitting}
        tone={confirmAction?.kind === 'approve' ? 'confirm' : confirmAction?.kind === 'reject' ? 'warning' : 'danger'}
        title={
          confirmAction?.kind === 'approve'
            ? `Approuver le devis ${confirmAction.quote.reference} ?`
            : confirmAction?.kind === 'reject'
              ? `Rejeter le devis ${confirmAction.quote.reference} ?`
              : confirmAction
                ? `Supprimer le devis ${confirmAction.quote.reference} ?`
                : ''
        }
        description={
          confirmAction?.kind === 'delete'
            ? 'Cette action est irréversible.'
            : confirmAction
              ? 'Un email sera envoyé au client pour l’informer de la décision.'
              : undefined
        }
        confirmLabel={
          confirmAction?.kind === 'approve'
            ? 'Approuver'
            : confirmAction?.kind === 'reject'
              ? 'Rejeter'
              : 'Supprimer'
        }
      >
        {confirmAction && (
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-black/50">Client:</span>{' '}
              <span className="font-medium text-black/85">{confirmAction.quote.customer.full_name}</span>
            </div>
            <div>
              <span className="text-black/50">Total:</span>{' '}
              <span className="font-bold text-brand">
                {formatGnf(confirmAction.quote.items_total ?? 0)}
              </span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </motion.div>
  );
}
