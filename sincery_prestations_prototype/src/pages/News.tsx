import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { articles, newsCategories } from '../data/news';
import { formatDate } from '../utils/format';
import { useSeo } from '../utils/seo';

export function News() {
  const [filter, setFilter] = useState('Toutes');

  useSeo(
    'Actualités | Sincery Prestations',
    'Conseils EPI, conseils sécurité, nouveaux produits et actualités de Sincery Prestations : suivez toute l’activité de l’entreprise.'
  );

  const published = articles.filter((a) => a.status === 'published');
  const visible =
  filter === 'Toutes' ?
  published :
  published.filter((a) => a.category === filter);

  const usedCategories = [
  'Toutes',
  ...newsCategories.filter((c) => published.some((a) => a.category === c))];


  return (
    <>
      <PageHero
        title="Actualités"
        subtitle="Conseils techniques, nouveautés du catalogue et informations sur la vie de l’entreprise."
        crumbs={[{ label: 'Actualités' }]} />
      

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div
          role="group"
          aria-label="Filtrer par catégorie"
          className="flex flex-wrap gap-2">
          
          {usedCategories.map((category) => {
            const active = filter === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(category)}
                className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                active ?
                'bg-brand text-white' :
                'border border-line bg-white text-black/65 hover:border-brand hover:text-brand'}`
                }>
                
                {category}
              </button>);

          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) =>
          <article
            key={article.id}
            className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-hover">
            
              <Link
              to={`/actualites/${article.slug}`}
              className="block aspect-[16/9] overflow-hidden bg-surface-alt">
              
                <img
                src={article.image}
                alt={article.title}
                loading="lazy"
                className="h-full w-full object-cover" />
              
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <span className="text-sm text-black/45">
                  {formatDate(article.publishedAt)} · {article.author}
                </span>
                <span className="w-fit rounded-sm inset-panel px-2 py-0.5 text-sm font-medium text-brand">
                  {article.category}
                </span>
                <h2 className="text-lg font-semibold text-black/90">
                  <Link
                  to={`/actualites/${article.slug}`}
                  className="hover:text-brand">
                  
                    {article.title}
                  </Link>
                </h2>
                <p className="text-sm text-black/65 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-auto pt-2">
                  <Link
                  to={`/actualites/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-base font-semibold text-brand hover:text-brand-dark">
                  
                    Lire l’article
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>

        {visible.length === 0 &&
        <p className="mt-8 rounded-lg border border-line bg-white p-10 text-center text-base text-black/65">
            Aucun article publié dans cette catégorie pour le moment.
          </p>
        }
      </div>
    </>);

}