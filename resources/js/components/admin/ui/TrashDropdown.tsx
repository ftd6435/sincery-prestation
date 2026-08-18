import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDownIcon,
  EraserIcon,
  RefreshCwIcon,
  Trash2Icon,
  TrashIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { api } from '../../../lib/api';
import { twMerge } from 'tailwind-merge';

export interface TrashDropdownProps {
  /** e.g. 'produits' → used as label, also as resource in /v1/admin/{resource} */
  resource: string;
  /** Human-readable singular label, e.g. "le produit" */
  singularLabel: string;
  /** Human-readable plural label, e.g. "produits" */
  pluralLabel: string;
  /** Optional click "Voir la corbeille" handler. If omitted, button sets internal `showTrash`. */
  onViewTrash?: () => void;
  /** Optional click "Quitter la corbeille" handler when viewing trash. */
  onExitTrash?: () => void;
  /** When true, renders "Quitter la corbeille" instead of "Voir la corbeille". */
  isViewingTrash?: boolean;
  /** Number of deleted items shown as badge. */
  trashCount?: number;
  /** Called after successful restore / empty to refresh parent list. */
  onMutated?: () => void | Promise<void>;
  /** Size passed to Button. Default: sm */
  size?: 'sm' | 'md';
  /** Extra actions rendered as first children inside the opened <ul> menu. */
  extraActions?: ReactNode;
  className?: string;
}

export function TrashDropdown({
  resource,
  singularLabel,
  pluralLabel,
  onViewTrash,
  onExitTrash,
  isViewingTrash = false,
  trashCount,
  onMutated,
  size = 'sm',
  extraActions,
  className,
}: TrashDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [emptyOpen, setEmptyOpen] = useState(false);
  const [emptyLoading, setEmptyLoading] = useState(false);

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

  async function handleEmptyTrash() {
    setEmptyLoading(true);
    try {
      await api.delete(`/v1/admin/${resource}/trash/empty`);
      toast.success(`${pluralLabel.charAt(0).toUpperCase() + pluralLabel.slice(1)} supprimés définitivement`, {
        description: `La corbeille des ${pluralLabel} a été vidée.`,
      });
      setEmptyOpen(false);
      setOpen(false);
      await onMutated?.();
    } catch {
      toast.error(`Impossible de vider la corbeille des ${pluralLabel}`);
    } finally {
      setEmptyLoading(false);
    }
  }

  return (
    <>
      <div ref={wrapperRef} className={twMerge('relative inline-block', className)}>
        <Button
          variant={isViewingTrash ? 'warning' : 'secondary'}
          size={size}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          iconLeft={<TrashIcon className="h-4 w-4" aria-hidden />}
          iconRight={
            <ChevronDownIcon
              className={twMerge('h-4 w-4 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          }
        >
          {isViewingTrash ? 'Corbeille' : 'Corbeille'}
          {typeof trashCount === 'number' && (
            <span
              className={twMerge(
                'ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold',
                isViewingTrash ? 'bg-white/20 text-white' : 'bg-danger-bg text-danger',
              )}
            >
              {trashCount}
            </span>
          )}
        </Button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 z-40 mt-2 w-64 origin-top-right divide-y divide-line rounded-lg border border-line bg-white p-1.5 shadow-elevated"
            >
              {extraActions && (
                <li className="pb-1.5">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-black/45">
                    Actions rapides
                  </div>
                  {extraActions}
                </li>
              )}

              <li className="py-1.5">
                {isViewingTrash ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      onExitTrash?.();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-black/80 hover:bg-surface-alt hover:text-black/95"
                  >
                    <RefreshCwIcon className="h-4 w-4 text-black/55" aria-hidden />
                    Revenir à la liste
                  </button>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      onViewTrash?.();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-black/80 hover:bg-surface-alt hover:text-black/95"
                  >
                    <Trash2Icon className="h-4 w-4 text-black/55" aria-hidden />
                    Voir la corbeille
                    {typeof trashCount === 'number' && (
                      <span className="ml-auto rounded-full bg-black/5 px-1.5 py-0.5 text-xs font-semibold text-black/65">
                        {trashCount}
                      </span>
                    )}
                  </button>
                )}
              </li>

              <li className="py-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setEmptyOpen(true);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                >
                  <EraserIcon className="h-4 w-4" aria-hidden />
                  Vider la corbeille
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={emptyOpen}
        onClose={() => !emptyLoading && setEmptyOpen(false)}
        onConfirm={handleEmptyTrash}
        tone="danger"
        loading={emptyLoading}
        dismissible={!emptyLoading}
        title={`Vider la corbeille des ${pluralLabel} ?`}
        description={`Cette action est irréversible. Tous ${singularLabel} dans la corbeille seront supprimés définitivement.`}
        confirmLabel="Vider la corbeille"
      />
    </>
  );
}

export async function restoreResource(resource: string, id: number | string, label: string) {
  await api.post(`/v1/admin/${resource}/${id}/restore`);
  toast.success(`${label} restauré`, { description: 'Élément restauré avec succès.' });
}

export async function forceDeleteResource(resource: string, id: number | string, label: string) {
  await api.delete(`/v1/admin/${resource}/${id}/force`);
  toast.success(`${label} supprimé définitivement`);
}
