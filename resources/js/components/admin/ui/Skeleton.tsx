import type { CSSProperties, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

const SHIMMER =
  'animate-pulse bg-gradient-to-r from-surface-alt via-line via-40% to-surface-alt bg-[length:200%_100%]';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, style, rounded = 'md' }: SkeletonProps) {
  const cls = twMerge(
    'inline-block shrink-0',
    SHIMMER,
    rounded === 'sm' && 'rounded-sm',
    rounded === 'md' && 'rounded-md',
    rounded === 'lg' && 'rounded-lg',
    rounded === 'full' && 'rounded-full',
    className,
  );
  return <span aria-hidden className={cls} style={style} />;
}

export function SkeletonCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 px-4 py-3">
      <Skeleton className="h-8 w-8" rounded="full" />
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} />
      ))}
    </div>
  );
}

export function SkeletonImage({ className }: { className?: string }) {
  return <Skeleton className={twMerge('aspect-[4/3] w-full', className)} />;
}

export function SkeletonKpiCard() {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-card">
      <Skeleton className="h-10 w-10" rounded="full" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
