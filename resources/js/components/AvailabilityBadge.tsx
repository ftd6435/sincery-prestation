import type { Availability } from '../types/catalog';
import { availabilityLabels } from '../utils/format';
import { StatusBadge, type Tone } from './ui/StatusBadge';

const tones: Record<Availability, Tone> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger'
};

export function AvailabilityBadge({
  availability


}: {availability: Availability;}) {
  return (
    <StatusBadge tone={tones[availability]}>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current" />
      
      {availabilityLabels[availability]}
    </StatusBadge>);

}