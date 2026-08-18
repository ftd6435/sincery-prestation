import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { SkeletonTable } from './Skeleton';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  /** How to render the cell for desktop (table layout). */
  render: (row: T, index: number) => ReactNode;
  /** Optionally override mobile stacked view label (defaults to header). */
  mobileLabel?: ReactNode;
  /** Hide this column below the given breakpoint. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface DataTableProps<T extends { id?: number | string }> {
  columns: DataTableColumn<T>[];
  rows: readonly T[];
  loading?: boolean;
  /** Rows to render when loading (defaults to 6). */
  skeletonRows?: number;
  empty?: ReactNode;
  emptyTitle?: string;
  emptyHint?: string;
  emptyAction?: ReactNode;
  rowKey?: (row: T, idx: number) => string | number;
  rowActions?: (row: T, idx: number) => ReactNode;
  /** Gap under each mobile stacked card. */
  compact?: boolean;
  className?: string;
  wrapperClassName?: string;
}

function hideClass(hide?: 'sm' | 'md' | 'lg' | 'xl') {
  switch (hide) {
    case 'sm':
      return 'hidden sm:table-cell';
    case 'md':
      return 'hidden md:table-cell';
    case 'lg':
      return 'hidden lg:table-cell';
    case 'xl':
      return 'hidden xl:table-cell';
    default:
      return '';
  }
}

function hideHeaderClass(hide?: 'sm' | 'md' | 'lg' | 'xl') {
  switch (hide) {
    case 'sm':
      return 'hidden sm:table-cell';
    case 'md':
      return 'hidden md:table-cell';
    case 'lg':
      return 'hidden lg:table-cell';
    case 'xl':
      return 'hidden xl:table-cell';
    default:
      return '';
  }
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  rows,
  loading,
  skeletonRows = 6,
  empty,
  emptyTitle = 'Aucun résultat',
  emptyHint = 'Aucune donnée à afficher pour le moment.',
  emptyAction,
  rowKey,
  rowActions,
  compact = false,
  className,
  wrapperClassName,
}: DataTableProps<T>) {
  return (
    <div
      className={twMerge(
        'overflow-hidden rounded-lg border border-line bg-white shadow-card',
        wrapperClassName,
      )}
    >
      {/* Desktop / tablet table */}
      <div className="hidden min-w-full md:block">
        <div className="overflow-x-auto">
          <table className={twMerge('w-full border-collapse text-sm sm:text-base', className)}>
            <thead className="bg-surface-alt text-black/65">
              <tr>
                {columns.map((c) => (
                  <th
                    key={String(c.key)}
                    scope="col"
                    className={twMerge(
                      'px-4 py-3 text-left font-semibold',
                      c.headerClassName,
                      hideHeaderClass(c.hideBelow),
                    )}
                  >
                    {c.header}
                  </th>
                ))}
                {rowActions && (
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-black/85">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (rowActions ? 1 : 0)} className="p-0">
                    <div className="py-2">
                      <SkeletonTable rows={skeletonRows} columns={columns.length} />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (rowActions ? 1 : 0)}
                    className="px-4 py-14 text-center"
                  >
                    {empty ?? <EmptyState title={emptyTitle} hint={emptyHint} action={emptyAction} />}
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const k = rowKey ? rowKey(row, idx) : String(row.id ?? idx);
                  return (
                    <motion.tr
                      key={k}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut', delay: Math.min(idx * 0.015, 0.18) }}
                      className="group transition-colors hover:bg-[rgba(193,39,45,0.025)]"
                    >
                      {columns.map((c) => (
                        <td
                          key={String(c.key)}
                          className={twMerge(
                            'px-4 py-3 align-top',
                            c.className,
                            hideClass(c.hideBelow),
                          )}
                        >
                          {c.render(row, idx)}
                        </td>
                      ))}
                      {rowActions && (
                        <td className="px-4 py-3 text-right align-top">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {rowActions(row, idx)}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile stacked card layout */}
      <div className="divide-y divide-line md:hidden">
        {loading ? (
          <div className="py-2">
            <SkeletonTable rows={skeletonRows} columns={3} />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-14 text-center">
            {empty ?? <EmptyState title={emptyTitle} hint={emptyHint} action={emptyAction} />}
          </div>
        ) : (
          rows.map((row, idx) => {
            const k = rowKey ? rowKey(row, idx) : String(row.id ?? idx);
            return (
              <motion.article
                key={k}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut', delay: Math.min(idx * 0.02, 0.2) }}
                className={twMerge('bg-white', !compact && 'px-4 py-4')}
              >
                <dl className="space-y-3">
                  {columns.map((c) => (
                    <div key={String(c.key)} className="grid grid-cols-[120px_1fr] items-start gap-3 text-sm">
                      <dt className="text-black/50">{c.mobileLabel ?? c.header}</dt>
                      <dd className="text-black/90">{c.render(row, idx)}</dd>
                    </div>
                  ))}
                </dl>
                {rowActions && (
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
                    {rowActions(row, idx)}
                  </div>
                )}
              </motion.article>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-black/55">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
          <path
            d="M3.5 6.5h17M5.5 6.5V18a1.5 1.5 0 0 0 1.5 1.5h10A1.5 1.5 0 0 0 18.5 18V6.5M8 6.5V5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5v1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-black/90">{title}</h3>
      <p className="mt-1 text-sm text-black/60">{hint}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
