import { Link } from 'react-router-dom';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../types/catalog';
import { formatPrice, getAvailability } from '../utils/format';
import { getCategory } from '../data/categories';
import { useSelection } from '../contexts/SelectionContext';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Button } from './ui/Button';

export function ProductCard({ product }: {product: Product;}) {
  const { add, has } = useSelection();
  const availability = getAvailability(product);
  const category = getCategory(product.categorySlug);
  const selected = has(product.id);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-hover">
      <Link
        to={`/boutique/${product.slug}`}
        className="block aspect-[4/3] overflow-hidden bg-surface-alt">

        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />

      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-black/45">
          <span className="rounded-sm bg-surface-alt px-2 py-0.5">
            {category?.name}
          </span>
          <span>Réf. {product.sku}</span>
        </div>

        <h3 className="text-lg font-semibold leading-snug text-black/90">
          <Link to={`/boutique/${product.slug}`} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>

        <p className="text-sm text-black/65 line-clamp-2">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <span
            className={
            product.quoteOnly ?
            'text-base font-semibold text-brand' :
            'text-xl font-bold text-brand'
            }>

            {formatPrice(product.price)}
          </span>
          <AvailabilityBadge availability={availability} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            to={`/boutique/${product.slug}`}
            variant="secondary"
            size="sm"
            className="flex-1">

            Voir le produit
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={availability === 'out_of_stock'}
            onClick={() => {
              add(product.id);
              toast.success('Ajouté à votre sélection', {
                description: product.name
              });
            }}>

            {selected ?
            <CheckIcon className="h-4 w-4" aria-hidden="true" /> :

            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            }
            {availability === 'out_of_stock' ? 'Indisponible' : 'Ma sélection'}
          </Button>
        </div>
      </div>
    </article>);

}
