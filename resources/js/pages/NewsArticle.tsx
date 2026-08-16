import { Link, useParams } from 'react-router-dom';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { articles, getArticle } from '../data/news';
import { formatDate } from '../utils/format';
import { useSeo } from '../utils/seo';

export function NewsArticle() {
  const { slug = '' } = useParams();
  const article = getArticle(slug);

  useSeo(
    article ?
    `${article.title} | Actualités Sincery Prestations` :
    'Article introuvable | Sincery Prestations',
    article?.excerpt ?? 'Cet article n’est plus disponible.'
  );

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-black/90">Article introuvable</h1>
        <p className="mt-3 text-base text-black/65">
          Cet article a été supprimé ou n’a jamais été publié.
        </p>
        <div className="mt-6 flex justify-center">
          <Button to="/actualites">Retour aux actualités</Button>
        </div>
      </div>);

  }

  const related = articles.
  filter((a) => a.id !== article.id && a.category === article.category).
  concat(articles.filter((a) => a.id !== article.id)).
  slice(0, 3);

  return (
    <>
      <PageHero
        title={article.title}
        crumbs={[
        { label: 'Actualités', to: '/actualites' },
        { label: article.category }]
        } />


      <article className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-wrap items-center gap-4 text-sm text-black/45">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" aria-hidden="true" />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" aria-hidden="true" />
            {article.author}
          </span>
          <span className="rounded-sm inset-panel px-2 py-0.5 font-medium text-brand">
            {article.category}
          </span>
        </div>

        <img
          src={article.image}
          alt={article.title}
          className="mt-5 aspect-[16/9] w-full rounded-lg border border-line object-cover" />


        <div className="mt-6 space-y-4">
          {article.content.map((paragraph, index) =>
          <p key={index} className="text-base text-black/65">
              {paragraph}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-lg inset-panel p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-black/90">
            Une question sur cet équipement ? Nos conseillers vous répondent.
          </p>
          <Button to="/contact" size="sm">
            Nous contacter
          </Button>
        </div>
      </article>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="text-2xl font-bold text-black/90">Articles similaires</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {related.map((item) =>
          <article
            key={item.id}
            className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-hover">

              <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover" />

              <div className="flex flex-1 flex-col gap-2 p-3">
                <span className="text-sm text-black/45">
                  {formatDate(item.publishedAt)}
                </span>
                <h3 className="text-lg font-semibold text-black/90">
                  <Link
                  to={`/actualites/${item.slug}`}
                  className="hover:text-brand">

                    {item.title}
                  </Link>
                </h3>
              </div>
            </article>
          )}
        </div>
      </section>
    </>);

}
