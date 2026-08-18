import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  MailIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  ReplyIcon,
  SendIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Tabs, type TabItem } from '../../components/admin/ui/Tabs';
import { DataTable, type DataTableColumn } from '../../components/admin/ui/DataTable';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { Drawer } from '../../components/admin/ui/Drawer';
import { SkeletonTable } from '../../components/admin/ui/Skeleton';
import type { Comment } from '../../types/admin';
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';
import { api } from '../../lib/api';

type TabValue = 'all' | 'pending' | 'approved' | 'rejected' | 'trash';

interface CommentExtended extends Comment {
  deleted_at?: string | null;
  is_rejected?: boolean | null;
}

type MenuAction = 'approve' | 'reject' | 'reply' | 'replyEmail' | 'delete';

interface CommentRowMenuProps {
  row: CommentExtended;
  onAction: (row: CommentExtended, action: MenuAction) => void;
  align?: 'left' | 'right';
}

function CommentRowMenu({ row, onAction, align = 'right' }: CommentRowMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handle(action: MenuAction) {
    setOpen(false);
    onAction(row, action);
  }

  const isApproved = row.is_approved === true;
  const isRejected = row.is_rejected === true;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Plus d'actions"
        className="flex h-9 w-9 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-surface-alt hover:text-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <MoreHorizontalIcon className="h-5 w-5" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={twMerge(
              'absolute z-40 mt-2 w-56 origin-top-right rounded-lg border border-line bg-white p-1.5 shadow-elevated',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {!isApproved && !isRejected && (
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handle('approve')}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-success hover:bg-success-bg"
                >
                  <CheckCircle2Icon className="h-4 w-4" aria-hidden />
                  Approuver
                </button>
              </li>
            )}
            {!isRejected && (
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handle('reject')}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-warning hover:bg-warning-bg"
                >
                  <XCircleIcon className="h-4 w-4" aria-hidden />
                  Rejeter
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => handle('reply')}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-black/80 hover:bg-surface-alt hover:text-black/95"
              >
                <ReplyIcon className="h-4 w-4 text-black/55" aria-hidden />
                Répondre
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => handle('replyEmail')}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-black/80 hover:bg-surface-alt hover:text-black/95"
              >
                <MailIcon className="h-4 w-4 text-black/55" aria-hidden />
                Répondre par email
              </button>
            </li>
            <li className="mt-1 border-t border-line pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => handle('delete')}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg"
              >
                <Trash2Icon className="h-4 w-4" aria-hidden />
                Supprimer
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getStatusTone(row: CommentExtended): 'success' | 'warning' | 'danger' | 'neutral' {
  if (row.deleted_at) return 'neutral';
  if (row.is_rejected) return 'danger';
  return row.is_approved ? 'success' : 'warning';
}

function getStatusLabel(row: CommentExtended): string {
  if (row.deleted_at) return 'Supprimé';
  if (row.is_rejected) return 'Rejeté';
  return row.is_approved ? 'Approuvé' : 'En attente';
}

export function AdminComments() {
  useSeo(
    'Commentaires | Administration Sincery Prestations',
    'Modération des commentaires publiés sur les articles du blog : approbation, rejet, réponse et corbeille.'
  );

  const [rows, setRows] = useState<CommentExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CommentExtended | null>(null);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyComment, setReplyComment] = useState<CommentExtended | null>(null);
  const [replyText, setReplyText] = useState('');

  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<CommentExtended[]>('/v1/comments');
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      toast.error('Erreur lors du chargement des commentaires.', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const counts = useMemo(() => {
    const all = rows.filter((r) => !r.deleted_at).length;
    const pending = rows.filter((r) => !r.deleted_at && !r.is_approved && !r.is_rejected).length;
    const approved = rows.filter((r) => !r.deleted_at && r.is_approved).length;
    const rejected = rows.filter((r) => !r.deleted_at && r.is_rejected).length;
    const trash = rows.filter((r) => r.deleted_at).length;
    return { all, pending, approved, rejected, trash };
  }, [rows]);

  const filteredRows = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return rows.filter((r) => !r.deleted_at && !r.is_approved && !r.is_rejected);
      case 'approved':
        return rows.filter((r) => !r.deleted_at && r.is_approved);
      case 'rejected':
        return rows.filter((r) => !r.deleted_at && r.is_rejected);
      case 'trash':
        return rows.filter((r) => r.deleted_at);
      default:
        return rows.filter((r) => !r.deleted_at);
    }
  }, [rows, activeTab]);

  const tabs = useMemo<TabItem<TabValue>[]>(() => {
    const items: TabItem<TabValue>[] = [
      { value: 'all', label: 'Tous', count: counts.all },
      {
        value: 'pending',
        label: 'En attente',
        count: counts.pending,
        tone: counts.pending > 0 ? 'warning' : 'default',
      },
      { value: 'approved', label: 'Approuvés', count: counts.approved, tone: 'success' },
      { value: 'rejected', label: 'Rejetés', count: counts.rejected, tone: 'danger' },
      { value: 'trash', label: 'Corbeille', count: counts.trash, tone: counts.trash > 0 ? 'danger' : 'default' },
    ];
    return items;
  }, [counts]);

  const description = useMemo(() => {
    let desc = 'Modération des avis et retours sur les articles';
    if (counts.pending > 0) {
      desc += ` · ${counts.pending} commentaire${counts.pending > 1 ? 's' : ''} en attente`;
    }
    return desc;
  }, [counts.pending]);

  async function handleSwitchStatus(id: number, approve: boolean) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/v1/comments/switch-status/${id}`);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, is_approved: approve, is_rejected: approve ? false : true }
            : r
        )
      );
      if (approve) {
        toast.success('Commentaire approuvé', {
          description: 'Il est maintenant visible sur le site.',
        });
      } else {
        toast.success('Commentaire rejeté', {
          description: 'Il n’est plus visible sur le site.',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(approve ? 'Impossible d’approuver le commentaire.' : 'Impossible de rejeter le commentaire.', {
        description: message,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function openReply(row: CommentExtended) {
    try {
      const fresh = await api.get<CommentExtended>(`/v1/comments/${row.id}`);
      setReplyComment(fresh ?? row);
    } catch {
      setReplyComment(row);
    }
    setReplyText('');
    setReplyOpen(true);
  }

  async function handleReplySend() {
    if (!replyComment || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      await api.put(`/v1/comments/${replyComment.id}`, {
        reply: replyText.trim(),
        content: replyComment.content,
      });
      toast.success('Réponse envoyée', {
        description: 'Votre réponse a été enregistrée avec succès.',
      });
      setReplyOpen(false);
      setReplyComment(null);
      setReplyText('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('Impossible d’envoyer la réponse.', {
        description: message,
      });
    } finally {
      setReplyLoading(false);
    }
  }

  function handleReplyEmail(row: CommentExtended) {
    const postTitle = row.post?.title ?? 'votre commentaire';
    const subject = `Re: Commentaire sur « ${postTitle} »`;
    const body = row.author_email
      ? `Bonjour ${row.author_name ?? ''},\n\nÀ propos de votre commentaire :\n« ${row.content.slice(0, 200)}${row.content.length > 200 ? '…' : ''} »\n\n`
      : '';
    const href = row.author_email
      ? `mailto:${row.author_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      : undefined;
    if (!href) {
      toast.error('Aucune adresse email disponible pour ce commentaire');
      return;
    }
    window.location.href = href;
  }

  function openDelete(row: CommentExtended) {
    setPendingDelete(row);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/v1/comments/${pendingDelete.id}`);
      setRows((prev) =>
        prev.map((r) =>
          r.id === pendingDelete.id
            ? { ...r, deleted_at: new Date().toISOString() }
            : r
        )
      );
      toast.success('Commentaire supprimé', {
        description: 'Le commentaire a été déplacé dans la corbeille.',
      });
      setDeleteOpen(false);
      setPendingDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('Impossible de supprimer le commentaire.', {
        description: message,
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleMenuAction(row: CommentExtended, action: MenuAction) {
    switch (action) {
      case 'approve':
        void handleSwitchStatus(row.id, true);
        break;
      case 'reject':
        void handleSwitchStatus(row.id, false);
        break;
      case 'reply':
        void openReply(row);
        break;
      case 'replyEmail':
        handleReplyEmail(row);
        break;
      case 'delete':
        openDelete(row);
        break;
    }
  }

  const emptyStates = useMemo(() => {
    const map: Record<TabValue, { title: string; hint: string }> = {
      all: {
        title: 'Aucun commentaire',
        hint: 'Les commentaires de vos visiteurs apparaîtront ici.',
      },
      pending: {
        title: 'Aucun commentaire en attente',
        hint: 'Tous les commentaires ont été traités. Bon travail !',
      },
      approved: {
        title: 'Aucun commentaire approuvé',
        hint: 'Les commentaires approuvés apparaîtront ici.',
      },
      rejected: {
        title: 'Aucun commentaire rejeté',
        hint: 'Les commentaires rejetés apparaîtront ici.',
      },
      trash: {
        title: 'Corbeille vide',
        hint: 'Les commentaires supprimés apparaîtront ici.',
      },
    };
    return map;
  }, []);

  const columns: DataTableColumn<CommentExtended>[] = [
    {
      key: 'author',
      header: 'Auteur',
      render: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand"
              aria-hidden
            >
              {getInitials(row.author_name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-black/90">
                {row.author_name ?? 'Anonyme'}
              </div>
              {row.author_email && (
                <a
                  href={`mailto:${row.author_email}`}
                  className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate rounded-sm bg-surface-alt px-2 py-0.5 text-xs text-black/60 hover:bg-black/10 hover:text-black/80"
                >
                  <MailIcon className="h-3 w-3 shrink-0" aria-hidden />
                  <span className="truncate">{row.author_email}</span>
                </a>
              )}
              {row.parent_id && (
                <div className="mt-1 text-xs text-black/45">
                  ↳ En réponse à {row.parent?.author_name ?? 'un commentaire'}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'post',
      header: 'Article',
      hideBelow: 'md',
      render: (row) =>
        row.post ? (
          <a
            href={`#/actualites/${row.post.slug}`}
            className="inline-flex max-w-full items-center gap-1.5 text-base font-medium text-brand hover:underline"
          >
            <MessageCircleIcon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{row.post.title}</span>
          </a>
        ) : (
          <span className="text-base text-black/45">Article inconnu</span>
        ),
    },
    {
      key: 'content',
      header: 'Contenu',
      render: (row) => (
        <p className="line-clamp-2 max-w-prose text-base leading-relaxed text-black/70">
          {row.content}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      hideBelow: 'lg',
      render: (row) => (
        <StatusBadge tone={getStatusTone(row)}>{getStatusLabel(row)}</StatusBadge>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      hideBelow: 'sm',
      render: (row) =>
        row.created_at ? (
          <span className="text-base text-black/65">{formatShortDate(row.created_at)}</span>
        ) : null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <AdminPageHeader title="Commentaires" description={description} />

      <div className="mb-4">
        <Tabs<TabValue>
          value={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
        />
      </div>

      {error && !loading && (
        <AdminCard className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-bg">
                <AlertTriangleIcon className="h-5 w-5 text-danger" aria-hidden />
              </span>
              <div>
                <p className="text-base font-semibold text-black/90">
                  Erreur lors du chargement des commentaires.
                </p>
                <p className="text-sm text-black/65">{error}</p>
              </div>
            </div>
            <Button variant="primary" onClick={() => void fetchComments()}>
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
          <div className="py-2">
            <SkeletonTable rows={6} columns={6} />
          </div>
        </div>
      ) : error ? null : (
        <>
          <div className="hidden md:block">
            <DataTable<CommentExtended>
              columns={columns}
              rows={filteredRows}
              emptyTitle={emptyStates[activeTab].title}
              emptyHint={emptyStates[activeTab].hint}
              rowKey={(row) => row.id}
              rowActions={(row) =>
                actionLoading[row.id] ? (
                  <span className="inline-flex h-9 items-center text-xs text-black/45">
                    Traitement…
                  </span>
                ) : (
                  <CommentRowMenu row={row} onAction={handleMenuAction} />
                )
              }
            />
          </div>

          <div className="md:hidden space-y-3">
            {filteredRows.length === 0 ? (
              <AdminCard className="p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-black/55">
                  <MessageCircleIcon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-black/90">
                  {emptyStates[activeTab].title}
                </h3>
                <p className="mt-1 text-sm text-black/60">{emptyStates[activeTab].hint}</p>
              </AdminCard>
            ) : (
              filteredRows.map((row, idx) => (
                <motion.article
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.18,
                    ease: 'easeOut',
                    delay: Math.min(idx * 0.02, 0.2),
                  }}
                >
                  <AdminCard className="p-4">
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/45 mb-1.5">
                          Auteur
                        </dt>
                        <dd>
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand"
                              aria-hidden
                            >
                              {getInitials(row.author_name)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-black/90">
                                {row.author_name ?? 'Anonyme'}
                              </p>
                              {row.author_email && (
                                <a
                                  href={`mailto:${row.author_email}`}
                                  className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate rounded-sm bg-surface-alt px-1.5 py-0.5 text-xs text-black/60 hover:bg-black/10 hover:text-black/80"
                                >
                                  <MailIcon className="h-3 w-3 shrink-0" aria-hidden />
                                  <span className="truncate">{row.author_email}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/45 mb-1.5">
                          Article
                        </dt>
                        <dd>
                          {row.post ? (
                            <a
                              href={`#/actualites/${row.post.slug}`}
                              className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                            >
                              <MessageCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              <span className="truncate">{row.post.title}</span>
                            </a>
                          ) : (
                            <span className="text-sm text-black/45">Article inconnu</span>
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-black/45 mb-1.5">
                          Contenu
                        </dt>
                        <dd>
                          <p className="line-clamp-3 text-sm leading-relaxed text-black/70">
                            {row.content}
                          </p>
                        </dd>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-black/45 mb-1.5">
                            Statut
                          </dt>
                          <dd>
                            <StatusBadge tone={getStatusTone(row)}>
                              {getStatusLabel(row)}
                            </StatusBadge>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-black/45 mb-1.5">
                            Date
                          </dt>
                          <dd>
                            <span className="text-sm text-black/65">
                              {row.created_at ? formatShortDate(row.created_at) : '—'}
                            </span>
                          </dd>
                        </div>
                      </div>
                    </dl>

                    <div className="mt-3 flex justify-end border-t border-line pt-3">
                      {actionLoading[row.id] ? (
                        <span className="inline-flex h-9 items-center text-xs text-black/45">
                          Traitement…
                        </span>
                      ) : (
                        <CommentRowMenu row={row} onAction={handleMenuAction} />
                      )}
                    </div>
                  </AdminCard>
                </motion.article>
              ))
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleDelete}
        tone="danger"
        loading={deleteLoading}
        dismissible={!deleteLoading}
        title={
          pendingDelete
            ? `Supprimer le commentaire de ${pendingDelete.author_name ?? 'anonyme'} ?`
            : 'Supprimer le commentaire ?'
        }
        description="Cette action déplace le commentaire dans la corbeille. Il pourra être restauré ultérieurement."
        confirmLabel="Supprimer le commentaire"
      />

      <Drawer
        open={replyOpen}
        onClose={() => !replyLoading && setReplyOpen(false)}
        dismissible={!replyLoading}
        title="Répondre au commentaire"
        description={
          replyComment
            ? `De ${replyComment.author_name ?? 'anonyme'} sur l'article « ${replyComment.post?.title ?? 'inconnu'} »`
            : undefined
        }
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={replyLoading}
              onClick={() => !replyLoading && setReplyOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              loading={replyLoading}
              disabled={replyLoading || !replyText.trim()}
              onClick={() => void handleReplySend()}
              iconLeft={<SendIcon className="h-4 w-4" aria-hidden />}
            >
              Envoyer la réponse
            </Button>
          </>
        }
      >
        {replyComment && (
          <div className="space-y-5">
            <div className="rounded-lg border border-line bg-surface-page p-4">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand"
                  aria-hidden
                >
                  {getInitials(replyComment.author_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-black/90">
                    {replyComment.author_name ?? 'Anonyme'}
                  </p>
                  {replyComment.author_email && (
                    <p className="text-xs text-black/45">{replyComment.author_email}</p>
                  )}
                  {replyComment.created_at && (
                    <p className="mt-0.5 text-xs text-black/45">
                      {formatShortDate(replyComment.created_at)}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-black/75 whitespace-pre-wrap">
                    {replyComment.content}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="reply-text"
                className="mb-1.5 block text-sm font-semibold text-black/85"
              >
                Votre réponse
              </label>
              <textarea
                id="reply-text"
                rows={8}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={replyLoading}
                placeholder="Écrivez votre réponse à ce commentaire…"
                className="w-full resize-y rounded-md border border-line bg-white px-3 py-2.5 text-sm text-black/85 placeholder:text-black/35 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-alt"
              />
              <p className="mt-1.5 text-xs text-black/45">
                {replyText.length} caractère{replyText.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
}
