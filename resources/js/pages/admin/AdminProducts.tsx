import { useState } from 'react';
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { products } from '../../data/products';
import { categories, getCategory } from '../../data/categories';
import { formatPrice } from '../../utils/format';
import { useSeo } from '../../utils/seo';

export function AdminProducts() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useSeo(
    'Produits | Administration Sincery Prestations',
    'Gestion du catalogue produits : création, modification, stock et statut de publication.'
  );

  const visible = products.filter((p) => {
    const matchQuery =
    !query ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase());
    const matchCategory = !category || p.categorySlug === category;
    return matchQuery && matchCategory;
  });

  return (
    <>
      <AdminPageHeader
        title="Produits"
        description={`${products.length} références dans le catalogue.`}
        actions={
        <Button size="sm">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Ajouter un produit
          </Button>
        } />
      

      <AdminCard>
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-line px-3 py-2">
            <SearchIcon
              className="h-4 w-4 shrink-0 text-black/45"
              aria-hidden="true" />
            
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit ou une référence…"
              aria-label="Rechercher un produit"
              className="w-full bg-transparent text-base outline-none placeholder:text-black/45" />
            
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrer par catégorie"
            className="rounded-md border border-line bg-white px-3 py-2 text-base outline-none focus:border-brand">
            
            <option value="">Toutes les catégories</option>
            {categories.map((c) =>
            <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            )}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <caption className="sr-only">Liste des produits</caption>
            <thead className="bg-surface-alt text-sm text-black/65">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Produit
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Référence
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Catégorie
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Prix
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Stock
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((product) =>
              <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                      src={product.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded-lg border border-line object-cover" />
                    
                      <span className="text-base font-semibold text-black/90">
                        {product.name}
                        {product.featured &&
                      <span className="ml-2 rounded-sm inset-panel px-1.5 py-0.5 text-sm font-medium text-brand">
                            Vedette
                          </span>
                      }
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {getCategory(product.categorySlug)?.name}
                  </td>
                  <td className="px-4 py-3 text-base font-semibold text-black/90">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                    tone={
                    product.stock === 0 ?
                    'danger' :
                    product.stock <= product.lowStockThreshold ?
                    'warning' :
                    'success'
                    }>
                    
                      {product.stock}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                    tone={
                    product.status === 'published' ? 'success' : 'neutral'
                    }>
                    
                      {product.status === 'published' ?
                    'Publié' :
                    product.status === 'draft' ?
                    'Brouillon' :
                    'Archivé'}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                      type="button"
                      aria-label={`Modifier ${product.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-surface-alt hover:text-brand">
                      
                        <PencilIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                      type="button"
                      aria-label={`Supprimer ${product.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-danger-bg hover:text-danger">
                      
                        <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {visible.length === 0 &&
        <p className="p-10 text-center text-base text-black/65">
            Aucun produit ne correspond à ces critères.
          </p>
        }
      </AdminCard>
    </>);

}