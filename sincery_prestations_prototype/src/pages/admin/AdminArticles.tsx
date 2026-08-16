import React from 'react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { articles, newsCategories } from '../../data/news';
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

export function AdminArticles() {
  useSeo(
    'Actualités | Administration Sincery Prestations',
    'Gestion des articles d’actualité et de leurs catégories.'
  );

  return (
    <>
      <AdminPageHeader
        title="Actualités"
        description="Rédigez et publiez les articles visibles sur le site."
        actions={
        <Button size="sm">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Nouvel article
          </Button>
        } />
      

      <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <caption className="sr-only">Liste des articles</caption>
              <thead className="bg-surface-alt text-sm text-black/65">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Article
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Catégorie
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Auteur
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Date
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
                {articles.map((article) =>
                <tr key={article.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                        src={article.image}
                        alt=""
                        loading="lazy"
                        className="h-10 w-16 rounded-lg border border-line object-cover" />
                      
                        <span className="text-base font-semibold text-black/90">
                          {article.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-base text-black/65">
                      {article.category}
                    </td>
                    <td className="px-4 py-3 text-base text-black/65">
                      {article.author}
                    </td>
                    <td className="px-4 py-3 text-base text-black/65">
                      {formatShortDate(article.publishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                      tone={
                      article.status === 'published' ? 'success' : 'neutral'
                      }>
                      
                        {article.status === 'published' ?
                      'Publié' :
                      'Brouillon'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                        type="button"
                        aria-label={`Modifier ${article.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-surface-alt hover:text-brand">
                        
                          <PencilIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                        type="button"
                        aria-label={`Supprimer ${article.title}`}
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
        </AdminCard>

        <AdminCard className="p-4">
          <h2 className="text-lg font-semibold text-black/90">
            Catégories d’actualités
          </h2>
          <ul className="mt-3 space-y-2">
            {newsCategories.map((category) =>
            <li
              key={category}
              className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-base text-black/65">
              
                {category}
                <span className="text-sm text-black/45">
                  {articles.filter((a) => a.category === category).length}
                </span>
              </li>
            )}
          </ul>
          <Button variant="secondary" size="sm" className="mt-4 w-full">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Ajouter une catégorie
          </Button>
        </AdminCard>
      </div>
    </>);

}