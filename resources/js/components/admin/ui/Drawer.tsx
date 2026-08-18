import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

/* ===========================================================================
 * Drawer — slide-over panel from the right (mobile-friendly, breakpoint-aware)
 * Width adapts to viewport: 100% mobile → 90% sm → 650px md → 780px lg → 960px xl
 * Pressing Escape / clicking backdrop calls onClose
 * ========================================================================= */

const DrawerContext = createContext<{ close: () => void } | null>(null);

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within Drawer');
  return ctx;
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** When clicking outside / ESC — default true. */
  dismissible?: boolean;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  size = 'md',
  dismissible = true,
}: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open || !dismissible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissible, onClose]);

  // lock scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const widthClass = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-full sm:max-w-md';
      case 'md':
        return 'w-full sm:w-[92%] md:max-w-[650px] lg:max-w-[780px]';
      case 'lg':
        return 'w-full sm:w-[92%] md:max-w-[860px] lg:max-w-[1000px]';
      case 'xl':
        return 'w-full md:w-[92%] lg:max-w-[1200px]';
      case 'full':
      default:
        return 'w-full md:w-[96%] lg:max-w-[1400px]';
    }
  }, [size]);

  return (
    <AnimatePresence>
      {open && (
        <DrawerContext.Provider value={{ close: onClose }}>
          <div
            className="fixed inset-0 z-[70] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => dismissible && onClose()}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px]"
              aria-hidden="true"
            />
            <motion.div
              ref={ref}
              role="document"
              tabIndex={-1}
              className={`relative z-10 h-full bg-white shadow-2xl shadow-black/30 ${widthClass}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-full w-full flex-col">
                {(title || description) && (
                  <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                    <div className="min-w-0 flex-1">
                      {typeof title === 'string' ? (
                        <h2 className="text-xl font-semibold text-black/90">{title}</h2>
                      ) : (
                        title
                      )}
                      {description && (
                        <p className="mt-1 text-sm text-black/65">{description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onClose()}
                      aria-label="Fermer"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-surface-alt hover:text-black/85"
                    >
                      <XIcon className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className={`${mounted ? '' : 'opacity-0'} p-5`}>{children}</div>
                </div>
                {footer && (
                  <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-page px-5 py-3">
                    {footer}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </DrawerContext.Provider>
      )}
    </AnimatePresence>
  );
}
