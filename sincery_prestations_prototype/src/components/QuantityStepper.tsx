import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

export function QuantityStepper({
  value,
  onChange,
  label = 'Quantité'




}: {value: number;onChange: (value: number) => void;label?: string;}) {
  return (
    <div
      className="inline-flex items-center rounded-md border border-line bg-white"
      role="group"
      aria-label={label}>
      
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Diminuer la quantité"
        className="flex h-10 w-10 items-center justify-center text-black/65 hover:bg-surface-alt hover:text-brand">
        
        <MinusIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        min={1}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="h-10 w-14 border-x border-line text-center text-base font-semibold text-black/90 outline-none focus:border-brand" />
      
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Augmenter la quantité"
        className="flex h-10 w-10 items-center justify-center text-black/65 hover:bg-surface-alt hover:text-brand">
        
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>);

}