import React from 'react';
import { GripVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { categories } from '../../data/categories';
import { products } from '../../data/products';
import { useSeo } from '../../utils/seo';

export function AdminCategories() {
  useSeo(
    'Catégories | Administration Sincery Prestations',
    'Gestion des catégories et sous-catégories du catalogue produits.'
  );

  return (
    <>
      <AdminPageHeader
        title="Catégories"
        description="Organisez l’arborescence du catalogue et l’ordre d’affichage en boutique."
        actions={
        <Button size="sm">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Ajouter une catégorie
          </Button>
        } />
      

      <div className="space-y-4">
        {categories.map((category, index) =>
        <AdminCard key={category.id}>
            <div className="flex flex-wrap items-start gap-4 p-4">
              <span
              className="mt-2 cursor-grab text-black/20"
              aria-label="Réorganiser">
              
                <GripVerticalIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <img
              src={category.image}
              alt=""
              loading="lazy"
              className="h-20 w-28 rounded-lg border border-line object-cover" />
            
              <div className="min-w-[220px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-black/90">
                    {category.name}
                  </h2>
                  <span className="rounded-sm bg-surface-alt px-2 py-0.5 text-sm text-black/65">
                    Ordre {index + 1}
                  </span>
                  <span className="rounded-sm inset-panel px-2 py-0.5 text-sm font-medium text-brand">
                    {
                  products.filter(
                    (p) => p.categorySlug === category.slug
                  ).length
                  }{' '}
                    produits
                  </span>
                </div>
                <p className="mt-1 text-sm text-black/65">
                  {category.description}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {category.children?.map((child) =>
                <li
                  key={child.slug}
                  className="rounded-sm border border-line px-2 py-1 text-sm text-black/65">
                  
                      {child.name}
                    </li>
                )}
                </ul>
              </div>
              <div className="flex gap-1">
                <button
                type="button"
                aria-label={`Modifier ${category.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-surface-alt hover:text-brand">
                
                  <PencilIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                type="button"
                aria-label={`Supprimer ${category.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-danger-bg hover:text-danger">
                
                  <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </AdminCard>
        )}
      </div>
    </>);

}