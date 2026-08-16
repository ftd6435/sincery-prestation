import { Link } from 'react-router-dom';
import type { ComponentType } from 'react';
import {
  ArrowRightIcon,
  FileTextIcon,
  HeadsetIcon,
  LayoutGridIcon,
  ShieldCheckIcon,
  TruckIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ProductCard';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { articles } from '../data/news';
import { advantages, company } from '../data/company';
import { formatDate } from '../utils/format';
import { useSeo } from '../utils/seo';

const icons: Record<string, ComponentType<{className?: string;}>> = {
  ShieldCheck: ShieldCheckIcon,
  LayoutGrid: LayoutGridIcon,
  Headset: HeadsetIcon,
  FileText: FileTextIcon,
  Truck: TruckIcon
};

export function Home() {
  useSeo(
    'Sincery Prestations | Équipements professionnels, EPI et matériel de sécurité',
    'Sincery Prestations propose des équipements de protection individuelle, accessoires pour engins, matériel de sécurité et équipements professionnels. Consultez le catalogue et demandez votre devis.'
  );

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const latest = articles.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-black">
        <img
          src="/aef75513-87f1-4112-acbf-caec4aeeda5a.jpg"
          alt="Équipements de protection individuelle disposés sur un sol de chantier"
          className="absolute inset-0 h-full w-full object-cover opacity-45" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl">

            <span className="inline-block rounded-sm bg-brand px-2.5 py-1 text-sm font-semibold text-white">
              Équipements professionnels
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white/95 sm:text-5xl">
              {company.name}
            </h1>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              {company.tagline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/boutique" size="lg">
                Découvrir la boutique
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                to="/devis"
                size="lg"
                variant="secondary"
                className="border-white bg-transparent text-white hover:bg-white/10">

                Demander un devis
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 rounded-lg border border-line bg-white p-6 shadow-card lg:grid-cols-[1.6fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-black/90">
              Un partenaire unique pour équiper vos équipes
            </h2>
            <p className="mt-3 text-base text-black/65">{company.intro}</p>
          </div>
          <div className="lg:justify-self-end">
            <Button to="/a-propos" variant="secondary">
              En savoir plus
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <h2 className="text-2xl font-bold text-black/90">
          Nos catégories principales
        </h2>
        <p className="mt-2 text-base text-black/65">
          Quatre familles de produits pour couvrir l’ensemble de vos besoins.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) =>
          <article
            key={category.slug}
            className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-hover">

              <Link
              to={`/boutique/${category.slug}`}
              className="block aspect-[4/3] overflow-hidden bg-surface-alt">

                <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />

              </Link>
              <div className="flex flex-1 flex-col gap-3 p-3">
                <h3 className="text-lg font-semibold text-black/90">
                  {category.name}
                </h3>
                <p className="text-sm text-black/65">{category.description}</p>
                <div className="mt-auto pt-1">
                  <Link
                  to={`/boutique/${category.slug}`}
                  className="inline-flex items-center gap-1.5 text-base font-semibold text-brand hover:text-brand-dark">

                    Voir les produits
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-black/90">
              Produits mis en avant
            </h2>
            <p className="mt-2 text-base text-black/65">
              Une sélection de références demandées par nos clients
              professionnels.
            </p>
          </div>
          <Link
            to="/boutique"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-brand hover:text-brand-dark">

            Voir tout le catalogue
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) =>
          <ProductCard key={product.id} product={product} />
          )}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-black/90">
            Pourquoi choisir Sincery Prestations ?
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {advantages.map((advantage) => {
              const Icon = icons[advantage.icon];
              return (
                <div
                  key={advantage.title}
                  className="rounded-lg border border-line p-4">

                  <span className="flex h-10 w-10 items-center justify-center rounded-full inset-panel text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-black/90">
                    {advantage.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-black/65">
                    {advantage.text}
                  </p>
                </div>);

            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-black/90">
            Actualités récentes
          </h2>
          <Link
            to="/actualites"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-brand hover:text-brand-dark">

            Toutes les actualités
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {latest.map((article) =>
          <article
            key={article.id}
            className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-hover">

              <img
              src={article.image}
              alt={article.title}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover" />

              <div className="flex flex-1 flex-col gap-2 p-3">
                <span className="text-sm text-black/45">
                  {formatDate(article.publishedAt)} · {article.category}
                </span>
                <h3 className="text-lg font-semibold text-black/90">
                  {article.title}
                </h3>
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
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-lg bg-black px-6 py-10 text-center">
          <h2 className="text-2xl font-bold text-white/95 sm:text-4xl">
            Vous recherchez un équipement ou un produit spécifique ?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/70">
            Décrivez-nous votre besoin : nous vous répondons avec une
            proposition chiffrée et des références adaptées.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/devis" size="lg">
              Demander un devis
            </Button>
            <Button
              to="/contact"
              size="lg"
              variant="secondary"
              className="border-white bg-transparent text-white hover:bg-white/10">

              Nous contacter
            </Button>
          </div>
        </div>
      </section>
    </>);

}
