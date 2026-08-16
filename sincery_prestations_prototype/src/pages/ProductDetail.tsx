import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, FileTextIcon, PlusIcon, TruckIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../types/catalog';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { AvailabilityBadge } from '../components/AvailabilityBadge';
import { QuantityStepper } from '../components/QuantityStepper';
import { ProductCard } from '../components/ProductCard';
import { getCategory } from '../data/categories';
import { products } from '../data/products';
import { formatPrice, getAvailability } from '../utils/format';
import { useSelection } from '../contexts/SelectionContext';
import { useSeo } from '../utils/seo';

export function ProductDetail({ product }: {product: Product;}) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { add } = useSelection();
  const navigate = useNavigate();

  const category = getCategory(product.categorySlug);
  const availability = getAvailability(product);
  const related = products.
  filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).
  slice(0, 3);

  useSeo(
    `${product.name} | ${category?.name} | Sincery Prestations`,
    product.shortDescription
  );

  function addToSelection() {
    add(product.id, quantity);
    toast.success('Ajouté à votre sélection', { description: product.name });
  }

  return (
    <>
      <PageHero
        title={product.name}
        crumbs={[
        { label: 'Boutique', to: '/boutique' },
        { label: category?.name ?? '', to: `/boutique/${product.categorySlug}` },
        { label: product.name }]
        } />
      

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <img
                src={product.images[activeImage]}
                alt={`${product.name} — vue ${activeImage + 1}`}
                className="aspect-[4/3] w-full object-cover" />
              
            </div>
            {product.images.length > 1 &&
            <ul className="mt-3 flex gap-3">
                {product.images.map((image, index) =>
              <li key={image + index}>
                    <button
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Afficher la vue ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={`overflow-hidden rounded-lg border ${
                  index === activeImage ? 'border-brand' : 'border-line'}`
                  }>
                  
                      <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="h-20 w-20 object-cover" />
                  
                    </button>
                  </li>
              )}
              </ul>
            }
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-black/45">
              <Link
                to={`/boutique/${product.categorySlug}`}
                className="rounded-sm bg-surface-alt px-2 py-0.5 hover:text-brand">
                
                {category?.name}
              </Link>
              {product.subCategory && <span>{product.subCategory}</span>}
              <span>Réf. {product.sku}</span>
            </div>

            <h2 className="mt-3 text-2xl font-bold text-black/90">
              {product.name}
            </h2>
            <p className="mt-2 text-base text-black/65">
              {product.shortDescription}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <span className="text-xl font-bold text-brand">
                {formatPrice(product.price)}
              </span>
              <AvailabilityBadge availability={availability} />
              <span className="text-sm text-black/45">
                Unité de vente : {product.unit}
              </span>
            </div>

            <div className="mt-6 rounded-lg border border-line bg-white p-4">
              <div className="flex flex-wrap items-center gap-4">
                <QuantityStepper value={quantity} onChange={setQuantity} />
                <Button
                  onClick={addToSelection}
                  disabled={availability === 'out_of_stock'}
                  className="flex-1 sm:flex-none">
                  
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  Ajouter à ma sélection
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    add(product.id, quantity);
                    navigate('/devis');
                  }}>
                  
                  <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                  Demander un devis
                </Button>
              </div>
              {availability === 'out_of_stock' &&
              <p className="mt-3 text-sm text-black/65">
                  Ce produit est momentanément indisponible. Demandez un devis
                  pour connaître le délai de réapprovisionnement.
                </p>
              }
              <p className="mt-3 flex items-center gap-2 text-sm text-black/45">
                <TruckIcon className="h-4 w-4" aria-hidden="true" />
                Préparation sous 24 à 48 h ouvrées selon disponibilité.
              </p>
            </div>

            <section className="mt-8">
              <h3 className="text-lg font-semibold text-black/90">
                Description
              </h3>
              <p className="mt-2 text-base text-black/65">
                {product.description}
              </p>
            </section>

            <section className="mt-8">
              <h3 className="text-lg font-semibold text-black/90">
                Caractéristiques techniques
              </h3>
              <dl className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
                {product.specs.map((spec) =>
                <div
                  key={spec.label}
                  className="flex justify-between gap-4 px-4 py-2.5">
                  
                    <dt className="text-base text-black/65">{spec.label}</dt>
                    <dd className="text-base font-semibold text-black/90">
                      {spec.value}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </div>

        {related.length > 0 &&
        <section className="mt-12">
            <h2 className="text-2xl font-bold text-black/90">
              Produits similaires
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) =>
            <ProductCard key={p.id} product={p} />
            )}
            </div>
          </section>
        }
      </div>
    </>);

}

export function ProductNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-black/90">Produit introuvable</h1>
      <p className="mt-3 text-base text-black/65">
        Cette référence n’existe plus ou a été retirée du catalogue.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button to="/boutique">Retour à la boutique</Button>
        <Button to="/contact" variant="secondary">
          Nous contacter
        </Button>
      </div>
    </div>);

}