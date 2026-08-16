import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { categories, getCategory } from '../data/categories';
import { products } from '../data/products';
import { getAvailability } from '../utils/format';
import { useSeo } from '../utils/seo';

const sortOptions = [
{ value: 'pertinence', label: 'Pertinence' },
{ value: 'prix-asc', label: 'Prix croissant' },
{ value: 'prix-desc', label: 'Prix décroissant' },
{ value: 'nouveautes', label: 'Nouveautés' },
{ value: 'nom', label: 'Nom (A-Z)' }];


const PER_PAGE = 6;

export function Shop({ categorySlug }: {categorySlug?: string;}) {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = categorySlug ? getCategory(categorySlug) : undefined;
  const query = params.get('q') ?? '';
  const sort = params.get('tri') ?? 'pertinence';
  const page = Number(params.get('page') ?? '1');
  const selectedCategories = categorySlug ?
  [categorySlug] :
  params.get('categories')?.split(',').filter(Boolean) ?? [];

  useSeo(
    activeCategory ?
    `${activeCategory.name} | Boutique Sincery Prestations` :
    'Boutique | Sincery Prestations',
    activeCategory ?
    `${activeCategory.description} Consultez les produits ${activeCategory.name} de Sincery Prestations et demandez votre devis.` :
    'Catalogue complet Sincery Prestations : EPI, accessoires pour engins, équipements de sécurité et matériel professionnel. Recherchez, filtrez et demandez un devis.'
  );

  function update(next: Record<string, string | null>) {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === '') merged.delete(key);else
      merged.set(key, value);
    });
    if (!('page' in next)) merged.delete('page');
    setParams(merged);
  }

  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug) ?
    selectedCategories.filter((s) => s !== slug) :
    [...selectedCategories, slug];
    update({ categories: next.join(',') });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => p.status === 'published');

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.categorySlug));
    }
    if (q) {
      list = list.filter(
        (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    if (sort === 'prix-asc') {
      sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sort === 'prix-desc') {
      sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    } else if (sort === 'nouveautes') {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === 'nom') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    } else {
      sorted.sort(
        (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        Number(getAvailability(a) === 'out_of_stock') -
        Number(getAvailability(b) === 'out_of_stock')
      );
    }
    return sorted;
  }, [query, sort, selectedCategories]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const filtersPanel =
  <div className="space-y-6">
      <fieldset>
        <legend className="text-lg font-semibold text-black/90">
          Catégories
        </legend>
        <div className="mt-3 space-y-2">
          {categories.map((category) => {
          const checked = selectedCategories.includes(category.slug);
          return (
            <label
              key={category.slug}
              className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-base transition-colors ${
              checked ?
              'border-brand bg-[rgba(193,39,45,0.05)] text-black/90' :
              'border-line bg-white text-black/65 hover:border-black/20'} ${
              categorySlug ? 'pointer-events-none opacity-70' : ''}`}>
              
                <input
                type="checkbox"
                checked={checked}
                disabled={Boolean(categorySlug)}
                onChange={() => toggleCategory(category.slug)}
                className="h-4 w-4 accent-[#C1272D]" />
              
                <span className="flex-1">{category.name}</span>
                <span className="text-sm text-black/45">
                  {
                products.filter((p) => p.categorySlug === category.slug).
                length
                }
                </span>
              </label>);

        })}
        </div>
      </fieldset>

      {activeCategory?.children &&
    <div>
          <h2 className="text-lg font-semibold text-black/90">
            Sous-catégories
          </h2>
          <ul className="mt-3 space-y-1.5 text-base text-black/65">
            {activeCategory.children.map((child) =>
        <li key={child.slug}>— {child.name}</li>
        )}
          </ul>
        </div>
    }

      <div className="rounded-lg inset-panel p-4">
        <h2 className="text-lg font-semibold text-black/90">
          Besoin d’un chiffrage ?
        </h2>
        <p className="mt-1.5 text-sm text-black/65">
          Ajoutez vos produits à votre sélection, puis demandez un devis en une
          étape.
        </p>
        <Button to="/devis" size="sm" className="mt-3 w-full">
          Demander un devis
        </Button>
      </div>
    </div>;


  return (
    <>
      <PageHero
        title={activeCategory ? activeCategory.name : 'Boutique'}
        subtitle={
        activeCategory ?
        activeCategory.description :
        'Consultez notre catalogue de produits professionnels : EPI, accessoires pour engins, sécurité et équipements.'
        }
        crumbs={
        activeCategory ?
        [
        { label: 'Boutique', to: '/boutique' },
        { label: activeCategory.name }] :

        [{ label: 'Boutique' }]
        } />
      

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside aria-label="Filtres" className="hidden lg:block">
          {filtersPanel}
        </aside>

        <div>
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-line px-3 py-2">
              <SearchIcon
                className="h-4 w-4 shrink-0 text-black/45"
                aria-hidden="true" />
              
              <input
                type="search"
                value={query}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="Rechercher un produit ou une référence…"
                aria-label="Rechercher dans le catalogue"
                className="w-full bg-transparent text-base outline-none placeholder:text-black/45" />
              
              {query &&
              <button
                type="button"
                onClick={() => update({ q: null })}
                aria-label="Effacer la recherche"
                className="text-black/45 hover:text-brand">
                
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              }
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="tri"
                className="hidden text-sm text-black/65 sm:block">
                
                Trier par
              </label>
              <select
                id="tri"
                value={sort}
                onChange={(e) => update({ tri: e.target.value })}
                className="rounded-md border border-line bg-white px-3 py-2 text-base text-black/90 outline-none focus:border-brand">
                
                {sortOptions.map((o) =>
                <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                )}
              </select>
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-base text-black/65 lg:hidden">
                
                <FilterIcon className="h-4 w-4" aria-hidden="true" />
                Filtres
              </button>
            </div>
          </div>

          {filtersOpen &&
          <div className="mt-3 rounded-lg border border-line bg-white p-4 lg:hidden">
              {filtersPanel}
            </div>
          }

          <p className="mt-4 text-sm text-black/65" role="status">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''} trouvé
            {filtered.length > 1 ? 's' : ''}
            {query && ` pour « ${query} »`}
          </p>

          {visible.length === 0 ?
          <div className="mt-6 rounded-lg border border-line bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-black/90">
                Aucun produit ne correspond à votre recherche
              </h2>
              <p className="mt-2 text-base text-black/65">
                Essayez d’élargir vos filtres, ou contactez-nous : nous pouvons
                sourcer des références sur demande.
              </p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                variant="secondary"
                onClick={() => setParams(new URLSearchParams())}>
                
                  Réinitialiser les filtres
                </Button>
                <Button to="/contact">Nous contacter</Button>
              </div>
            </div> :

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) =>
            <ProductCard key={product.id} product={product} />
            )}
            </div>
          }

          {pageCount > 1 &&
          <nav
            aria-label="Pagination"
            className="mt-8 flex items-center justify-center gap-2">
            
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
            <button
              key={n}
              type="button"
              aria-current={n === currentPage ? 'page' : undefined}
              onClick={() => {
                const merged = new URLSearchParams(params);
                merged.set('page', String(n));
                setParams(merged);
              }}
              className={`h-10 w-10 rounded-md border text-base font-semibold transition-colors ${
              n === currentPage ?
              'border-brand bg-brand text-white' :
              'border-line bg-white text-black/65 hover:border-brand hover:text-brand'}`
              }>
              
                  {n}
                </button>
            )}
            </nav>
          }
        </div>
      </div>
    </>);

}