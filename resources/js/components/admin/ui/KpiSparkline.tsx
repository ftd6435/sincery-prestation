import { useState, useMemo, type CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * KpiSparkline — mini SVG line/area chart.
 *
 * Zero-dependency; used inside Dashboard KPI cards to show recent trend.
 * Expects `values[]` of numbers (any length >= 2).
 */

interface KpiSparklineProps {
  values: number[];
  className?: string;
  width?: number;
  height?: number;
  /** Stroke color (default --color-brand). */
  stroke?: string;
  /** Fill gradient top color (defaults to stroke 25%). */
  fillTop?: string;
  /** If positive is "good", arrow up green, else arrow down red. */
  positiveIsGood?: boolean;
  /** delta % vs previous — if provided, shows a tiny colored pill on the right. */
  deltaPercent?: number;
  style?: CSSProperties;
}

export function KpiSparkline({
  values,
  className,
  width = 120,
  height = 40,
  stroke = '#c1272d',
  fillTop,
  positiveIsGood = true,
  deltaPercent,
  style,
}: KpiSparklineProps) {
  const cleaned = useMemo(
    () =>
      values
        .map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0))
        .filter((_, i, a) => a.length > 1 || i === 0),
    [values],
  );

  const { pathD, areaD, lastVal, firstVal } = useMemo(() => {
    const n = cleaned.length;
    if (n === 0) return { pathD: '', areaD: '', lastVal: 0, firstVal: 0 };
    if (n === 1) {
      const single = cleaned[0] ?? 0;
      return {
        pathD: `M 0 ${height} L ${width} ${height}`,
        areaD: `M 0 ${height} L ${width} ${height} L ${width} ${height} L 0 ${height} Z`,
        lastVal: single,
        firstVal: single,
      };
    }
    const min = Math.min(...cleaned);
    const max = Math.max(...cleaned);
    const span = max - min === 0 ? 1 : max - min;
    const padX = 2;
    const w = width - padX * 2;
    const stepX = n > 1 ? w / (n - 1) : w;
    const hPad = 4;
    const usableH = height - hPad * 2;
    const pts = cleaned.map((v, i) => {
      const x = padX + stepX * i;
      const y = hPad + usableH * (1 - (v - min) / span);
      return [x, y] as const;
    });

    const pathD = pts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(' ');
    const areaD =
      `M ${pts[0][0].toFixed(2)} ${height} ` +
      pts.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') +
      ` L ${pts[n - 1][0].toFixed(2)} ${height} Z`;

    return {
      pathD,
      areaD,
      lastVal: cleaned[n - 1] ?? 0,
      firstVal: cleaned[0] ?? 0,
    };
  }, [cleaned, width, height]);

  const gradId = `sg-${useRandomId()}`;
  const top = fillTop ?? withAlpha(stroke, 0.22);

  const computedDelta =
    typeof deltaPercent === 'number'
      ? deltaPercent
      : firstVal === 0
        ? lastVal === 0
          ? 0
          : 100
        : ((lastVal - firstVal) / Math.abs(firstVal)) * 100;

  const up = computedDelta > 0;
  const flat = Math.abs(computedDelta) < 0.1;
  const good = flat ? true : positiveIsGood ? up : !up;
  const deltaColor = flat ? '#64748b' : good ? '#10b981' : '#ef4444';

  return (
    <div
      className={twMerge('flex items-center justify-end gap-2', className)}
      style={style}
      aria-hidden
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={top} />
            <stop offset="100%" stopColor={withAlpha(stroke, 0.02)} />
          </linearGradient>
        </defs>
        {areaD && <path d={areaD} fill={`url(#${gradId})`} />}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {lastVal !== undefined && (
          <circle
            cx={width - 2}
            cy={height / 2 + (hPadCenter({ values: cleaned, width, height }) ?? 0)}
            r={0}
            fill={stroke}
          />
        )}
      </svg>
      <span
        className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
        style={{
          backgroundColor: withAlpha(deltaColor, 0.12),
          color: deltaColor,
        }}
      >
        <span aria-hidden>{flat ? '≈' : up ? '▲' : '▼'}</span>
        {`${flat ? '0' : (up ? '+' : '') + computedDelta.toFixed(1)}%`}
      </span>
    </div>
  );
}

function hPadCenter({
  values,
  width,
  height,
}: {
  values: number[];
  width: number;
  height: number;
}): number | null {
  const n = values.length;
  if (n < 1) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min === 0 ? 1 : max - min;
  const hPad = 4;
  const usableH = height - hPad * 2;
  const last = values[n - 1] ?? 0;
  const y = hPad + usableH * (1 - (last - min) / span);
  return y - height / 2;
  // result unused but keeps TS strict happy; we use a 0-radius invisible dot
  void width;
}

function withAlpha(hex: string, alpha: number): string {
  if (!hex || typeof hex !== 'string') return `rgba(193, 39, 45, ${alpha})`;
  if (hex.startsWith('rgb')) {
    return hex.replace(/rgba?\(/, (m) => (m.includes('rgba') ? m : 'rgba(')).replace(/\)(?!.*\))$/, `, ${alpha})`);
  }
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return `rgba(193, 39, 45, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function useRandomId(): string {
  const [suffix] = useState(() => Math.random().toString(36).slice(2, 10));
  return 'x' + suffix;
}
