import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  EyeIcon,
  MailIcon,
  MailOpenIcon,
  MoreVerticalIcon,
  RefreshCwIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useSeo } from '../../utils/seo';
import { formatShortDate } from '../../utils/format';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, type DataTableColumn } from '../../components/admin/ui/DataTable';
import { Drawer } from '../../components/admin/ui/Drawer';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { Tabs, type TabItem } from '../../components/admin/ui/Tabs';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import type { ContactMessage } from '../../types/admin';

type TabValue = 'all' | 'unread' | 'read';

interface ContactMessageWithRead extends ContactMessage {
  is_read?: boolean;
}

export function AdminMessages() {
  useSeo(
    'Messages | Administration Sincery Prestations',
    'Consultation et traitement des messages reçus via le formulaire de contact.'
  );

  const [messages, setMessages] = useState<ContactMessageWithRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabValue>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<ContactMessageWithRead | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageWithRead | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ContactMessageWithRead[]>('/v1/contacts');
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

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

  const { unreadCount, readCount } = useMemo(() => {
    let u = 0;
    let r = 0;
    messages.forEach((m) => {
      if (m.is_read) r += 1;
      else u += 1;
    });
    return { unreadCount: u, readCount: r };
  }, [messages]);

  const tabs = [
    { value: 'all' as TabValue, label: 'Tous', count: messages.length },
    { value: 'unread' as TabValue, label: 'Non lus', count: unreadCount, tone: 'info' as const },
    { value: 'read' as TabValue, label: 'Lus', count: readCount, tone: 'success' as const },
  ];

  const visibleMessages = useMemo(() => {
    if (tab === 'all') return messages;
    if (tab === 'unread') return messages.filter((m) => !m.is_read);
    return messages.filter((m) => m.is_read);
  }, [messages, tab]);

  async function openDrawer(message: ContactMessageWithRead) {
    setSelected(message);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const full = await api.get<ContactMessageWithRead>(`/v1/contacts/${message.id}`);
      setSelected(full);
      if (!message.is_read) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
        );
      }
    } catch {
      toast.error('Impossible de charger le message');
    } finally {
      setDrawerLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await api.delete(`/v1/contacts/${deleteTarget.id}`);
      toast.success('Message supprimé', {
        description: `De ${deleteTarget.name}`,
      });
      setDeleteTarget(null);
      if (selected?.id === deleteTarget.id) {
        setDrawerOpen(false);
      }
      await fetchMessages();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Suppression échouée', { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const columns: DataTableColumn<ContactMessageWithRead>[] = [
    {
      key: 'sender',
      header: 'Expéditeur',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              row.is_read
                ? 'bg-surface-alt text-black/55'
                : 'bg-brand/10 text-brand'
            }`}
            aria-hidden
          >
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className={`truncate ${row.is_read ? 'text-black/80' : 'font-semibold text-black/95'}`}>
              {row.name}
            </div>
            <div className="truncate text-sm text-black/50">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Sujet',
      render: (row) => (
        <div>
          <div className={`truncate ${row.is_read ? 'text-black/80' : 'font-semibold text-black/95'}`}>
            {row.subject}
          </div>
          <div className="truncate text-sm text-black/50 max-w-md">
            {row.message.length > 120 ? row.message.slice(0, 120) + '…' : row.message}
          </div>
        </div>
      ),
    },
    {
      key: 'read',
      header: 'Statut',
      className: 'text-center',
      headerClassName: 'text-center',
      hideBelow: 'sm',
      render: (row) => (
        <div className="flex justify-center">
          {row.is_read ? (
            <StatusBadge tone="success">
              <MailOpenIcon className="h-3.5 w-3.5" aria-hidden />
              Lu
            </StatusBadge>
          ) : (
            <StatusBadge tone="info">
              <MailIcon className="h-3.5 w-3.5" aria-hidden />
              Non lu
            </StatusBadge>
          )}
        </div>
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
        title="Messages de contact"
        description="Messages reçus depuis le formulaire du site."
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
              onClick={() => void fetchMessages()}
            >
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      <div className="mb-4">
        <Tabs tabs={tabs as TabItem<TabValue>[]} value={tab} onChange={setTab} />
      </div>

      <DataTable
        columns={columns}
        rows={visibleMessages}
        loading={loading}
        emptyTitle="Aucun message"
        emptyHint={tab === 'all' ? 'Aucun message reçu pour le moment.' : tab === 'unread' ? 'Aucun message non lu.' : 'Aucun message lu.'}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<EyeIcon className="h-4 w-4" aria-hidden />}
              onClick={() => void openDrawer(row)}
            >
              Lire
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Actions pour le message de ${row.name}`}
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
                  <a
                    role="menuitem"
                    href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.subject)}`}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-info hover:bg-info-bg"
                  >
                    <MailIcon className="h-4 w-4" aria-hidden />
                    Répondre
                  </a>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                    onClick={() => {
                      setOpenMenuId(null);
                      setDeleteTarget(row);
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
        size="lg"
        title={selected?.subject ?? 'Message'}
        description={
          selected
            ? `De ${selected.name} <${selected.email}>${selected.phone ? ` · ${selected.phone}` : ''}`
            : undefined
        }
        footer={
          selected ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<Trash2Icon className="h-4 w-4" aria-hidden />}
                onClick={() => setDeleteTarget(selected)}
                disabled={submitting}
              >
                Supprimer
              </Button>
              <Button
                variant="primary"
                size="sm"
                iconLeft={<MailIcon className="h-4 w-4" aria-hidden />}
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
              >
                Répondre
              </Button>
            </>
          ) : undefined
        }
      >
        {!selected || drawerLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-md bg-line"
                style={{ height: i === 3 ? 200 : 40 }}
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <AdminCard className="p-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-black/45">De</dt>
                  <dd className="mt-1 font-medium text-black/90">{selected.name}</dd>
                  <dd className="text-sm text-black/60">{selected.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-black/45">Coordonnées</dt>
                  {selected.phone ? (
                    <dd className="mt-1 text-black/80">{selected.phone}</dd>
                  ) : (
                    <dd className="mt-1 text-sm italic text-black/50">Téléphone non renseigné</dd>
                  )}
                  <dd className="text-sm text-black/60 tabular-nums mt-1">
                    {selected.created_at ? formatShortDate(selected.created_at) : '—'}
                  </dd>
                </div>
              </dl>
            </AdminCard>

            <AdminCard className="p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-black/45">
                {selected.subject}
              </h3>
              <div className="mt-4 whitespace-pre-line leading-relaxed text-base text-black/80">
                {selected.message}
              </div>
            </AdminCard>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !submitting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        tone="danger"
        loading={submitting}
        dismissible={!submitting}
        title={deleteTarget ? `Supprimer le message de ${deleteTarget.name} ?` : ''}
        description="Cette action est irréversible. Le message sera supprimé définitivement."
        confirmLabel="Supprimer le message"
      >
        {deleteTarget && (
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-black/50">Sujet:</span>{' '}
              <span className="font-medium text-black/85">{deleteTarget.subject}</span>
            </div>
            <div>
              <span className="text-black/50">Email:</span>{' '}
              <span className="text-black/70">{deleteTarget.email}</span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </motion.div>
  );
}
