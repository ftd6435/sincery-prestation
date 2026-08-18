import { useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  count?: number | null;
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  disabled?: boolean;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Full width: tabs grow equally (default true for admin status filters). */
  fullWidth?: boolean;
  className?: string;
  /** Adds a subtle pill-like background row. */
  segmented?: boolean;
}

const toneBadge: Record<NonNullable<TabItem['tone']>, string> = {
  default: 'bg-black/10 text-black/65',
  danger: 'bg-danger-bg text-danger',
  warning: 'bg-warning-bg text-warning',
  success: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
};

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  fullWidth = true,
  className,
  segmented = true,
}: TabsProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [activeRect, setActiveRect] = useState<{ left: number; width: number } | null>(null);

  return (
    <div
      role="tablist"
      className={twMerge(
        'relative -mx-1 overflow-x-auto px-1 pb-0.5 sm:overflow-x-visible',
        segmented && 'rounded-lg bg-surface-alt p-1',
        className,
      )}
    >
      <div
        ref={rowRef}
        className={twMerge(
          'relative flex items-center gap-1',
          fullWidth && 'sm:grid sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none',
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              role="tab"
              type="button"
              aria-selected={isActive}
              disabled={tab.disabled || isActive}
              onClick={() => !tab.disabled && onChange(tab.value)}
              onMouseEnter={(e) => {
                if (isActive) {
                  const parent = rowRef.current;
                  if (!parent) return;
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const pr = parent.getBoundingClientRect();
                  setActiveRect({ left: r.left - pr.left, width: r.width });
                }
              }}
              ref={(el) => {
                if (!el || !isActive) return;
                const parent = rowRef.current;
                if (!parent) return;
                requestAnimationFrame(() => {
                  const r = el.getBoundingClientRect();
                  const pr = parent.getBoundingClientRect();
                  setActiveRect({ left: r.left - pr.left, width: r.width });
                });
              }}
              className={twMerge(
                'relative z-10 flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors sm:text-base',
                isActive ? 'text-black/95' : 'text-black/55 hover:text-black/85',
                tab.disabled && 'opacity-45 pointer-events-none',
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={twMerge(
                    'inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
                    isActive ? 'bg-brand text-white' : toneBadge[tab.tone ?? 'default'],
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && segmented && activeRect && (
                <motion.span
                  layoutId="tab-active-bg"
                  className="absolute inset-0 -z-10 rounded-md bg-white shadow-sm"
                  aria-hidden
                  transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.7 }}
                />
              )}
            </button>
          );
        })}
        {segmented && activeRect && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-1 bottom-1 z-0 rounded-md bg-white shadow-sm"
            initial={false}
            animate={{ left: activeRect.left, width: activeRect.width }}
            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
          />
        )}
      </div>
    </div>
  );
}
