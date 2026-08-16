import React from 'react';
import { twMerge } from 'tailwind-merge';

export type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

const tones: Record<Tone, string> = {
  success: 'bg-success-bg text-[#047857]',
  danger: 'bg-danger-bg text-[#B91C1C]',
  warning: 'bg-warning-bg text-[#B45309]',
  info: 'bg-info-bg text-[#1D4ED8]',
  neutral: 'bg-black/5 text-black/65'
};

export function StatusBadge({
  tone,
  children,
  className




}: {tone: Tone;children: React.ReactNode;className?: string;}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-sm font-medium',
        tones[tone],
        className
      )}>
      
      {children}
    </span>);

}