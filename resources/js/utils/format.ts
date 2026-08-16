import type { Availability, Product } from '../types/catalog';

export function formatPrice(price: number | null): string {
  if (price === null) return 'Prix sur devis';
  return `${price.toLocaleString('fr-FR')} F CFA`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function getAvailability(product: Product): Availability {
  if (product.stock <= 0) return 'out_of_stock';
  if (product.stock <= product.lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

export const availabilityLabels: Record<Availability, string> = {
  in_stock: 'En stock',
  low_stock: 'Stock faible',
  out_of_stock: 'Rupture de stock'
};

export function generateReference(prefix: 'DEV' | 'CMD'): string {
  const year = new Date().getFullYear();
  const n = Math.floor(Math.random() * 999998) + 1;
  return `${prefix}-${year}-${String(n).padStart(6, '0')}`;
}