import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Button } from '../../ui/Button';

/**
 * ConfirmDialog — modal standard pour confirmation d'action destructive.
 * 4 tons (color + icône) : danger / warning / info / confirm.
 * Utiliser pour delete / forceDelete / reject quote / cancel order / etc.
 */

export type ConfirmTone = 'danger' | 'warning' | 'info' | 'confirm';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  tone?: ConfirmTone;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** when true, shows spinner in confirm button, disables everything */
  loading?: boolean;
  /** default true */
  dismissible?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  tone = 'danger',
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = 'Annuler',
  loading,
  dismissible = true,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open || !dismissible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissible, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const { confirmText, confirmVariant, Icon, iconClass, ringClass } = useMemo(() => {
    switch (tone) {
      case 'confirm':
        return {
          confirmText: confirmLabel ?? 'Confirmer',
          confirmVariant: 'primary' as const,
          Icon: CheckCircle2Icon,
          iconClass: 'text-success',
          ringClass: 'ring-success/30 bg-success-bg',
        };
      case 'warning':
        return {
          confirmText: confirmLabel ?? 'Continuer',
          confirmVariant: 'primary' as const,
          Icon: AlertTriangleIcon,
          iconClass: 'text-warning',
          ringClass: 'ring-warning/30 bg-warning-bg',
        };
      case 'info':
        return {
          confirmText: confirmLabel ?? 'OK',
          confirmVariant: 'primary' as const,
          Icon: AlertTriangleIcon,
          iconClass: 'text-info',
          ringClass: 'ring-info/30 bg-info-bg',
        };
      case 'danger':
      default:
        return {
          confirmText: confirmLabel ?? 'Supprimer',
          confirmVariant: 'danger' as const,
          Icon: Trash2Icon,
          iconClass: 'text-danger',
          ringClass: 'ring-danger/30 bg-danger-bg',
        };
    }
  }, [tone, confirmLabel]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:px-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden
            onClick={() => dismissible && !loading && onClose()}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full rounded-t-2xl border border-line bg-white shadow-2xl sm:rounded-xl sm:max-w-lg"
          >
            <div className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-8 ${ringClass}`}
                >
                  {tone === 'danger' && loading ? (
                    <XCircleIcon className={`h-6 w-6 ${iconClass} opacity-60`} aria-hidden />
                  ) : (
                    <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold leading-6 text-black/90">
                    {title}
                  </h3>
                  {description && (
                    <p className="mt-2 text-sm leading-6 text-black/70">{description}</p>
                  )}
                </div>
              </div>
              {children && (
                <div className="rounded-md border border-line bg-surface-page p-3 text-sm text-black/70">
                  {children}
                </div>
              )}
              <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  disabled={loading}
                  onClick={() => onClose()}
                  className="sm:min-w-[110px]"
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant={confirmVariant}
                  loading={loading}
                  disabled={loading}
                  onClick={() => void onConfirm()}
                  className="sm:min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
                      Traitement…
                    </>
                  ) : (
                    <>
                      {tone === 'danger' && <Trash2Icon className="h-4 w-4" aria-hidden />}
                      {confirmText}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
