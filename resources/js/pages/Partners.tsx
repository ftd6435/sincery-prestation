import { useState } from 'react';
import { ExternalLinkIcon, MapPinIcon, StarIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { partnerCategories, partners } from '../data/partners';
import { useSeo } from '../utils/seo';

export function Partners() {
  const [filter, setFilter] = useState('Tous');

  useSeo(
    'Nos partenaires | Sincery Prestations',
    'Découvrez les partenaires, fournisseurs et entreprises qui collaborent avec Sincery Prestations pour proposer des équipements et solutions professionnels de qualité.'
  );

  const active = partners.
  filter((p) => p.active).
  sort((a, b) => a.order - b.order);
  const featured = active.find((p) => p.featured);
  const others = active.filter((p) => !p.featured);
  const visible =
  filter === 'Tous' ? others : others.filter((p) => p.category === filter);

  const filters = [
  'Tous',
  ...partnerCategories.filter((c) => others.some((p) => p.category === c))];


  return (
    <>
      <PageHero
        title="Nos partenaires"
        subtitle="Fabricants, fournisseurs et partenaires techniques qui nous permettent de vous proposer des équipements fiables et conformes."
        crumbs={[{ label: 'Partenaires' }]} />
      

      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="max-w-3xl text-base text-black/65">
          Nos partenariats sont au cœur de notre capacité à vous servir : ils
          garantissent la qualité des produits distribués, la disponibilité des
          références et l’accès à un support technique compétent. Nous
          sélectionnons chaque partenaire sur la base de la conformité de ses
          produits et de la fiabilité de ses délais.
        </p>

        {featured &&
        <section
          aria-labelledby="partenaire-une"
          className="mt-8 grid gap-6 rounded-lg border border-brand bg-white p-6 shadow-card lg:grid-cols-[200px_1fr] lg:items-center">
          
            <div className="flex h-32 w-32 items-center justify-center rounded-lg inset-panel text-4xl font-bold text-brand">
              {featured.logoText}
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-2 py-0.5 text-sm font-semibold text-white">
                <StarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Partenaire à la une
              </span>
              <h2
              id="partenaire-une"
              className="mt-3 text-2xl font-bold text-black/90">
              
                {featured.name}
              </h2>
              <p className="mt-2 text-base text-black/65">
                {featured.description}
              </p>
              <p className="mt-3 text-sm text-black/45">
                {featured.sector} · {featured.city}, {featured.country}
              </p>
              <div className="mt-4">
                <Button href={featured.website} target="_blank" rel="noreferrer noopener" size="sm">
                  Visiter le site
                  <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </section>
        }

        <div
          role="group"
          aria-label="Filtrer les partenaires"
          className="mt-8 flex flex-wrap gap-2">
          
          {filters.map((category) => {
            const isActive = filter === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(category)}
                className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive ?
                'bg-brand text-white' :
                'border border-line bg-white text-black/65 hover:border-brand hover:text-brand'}`
                }>
                
                {category}
              </button>);

          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((partner) =>
          <article
            key={partner.id}
            className="flex flex-col rounded-lg border border-line bg-white p-4 shadow-card transition-shadow hover:shadow-hover">
            
              <div className="flex h-16 w-16 items-center justify-center rounded-lg inset-panel text-xl font-bold text-brand">
                {partner.logoText}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-black/90">
                {partner.name}
              </h2>
              <p className="mt-1 text-sm text-black/65">{partner.description}</p>
              <dl className="mt-3 space-y-1 text-sm text-black/45">
                <div className="flex gap-1.5">
                  <dt className="sr-only">Secteur</dt>
                  <dd>{partner.sector}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Localisation</dt>
                  <dd className="flex items-center gap-1.5">
                    <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {partner.city}, {partner.country}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Catégorie de partenariat</dt>
                  <dd>{partner.category}</dd>
                </div>
              </dl>
              <div className="mt-auto pt-4">
                <Button
                href={partner.website}
                target="_blank"
                rel="noreferrer noopener"
                variant="secondary"
                size="sm"
                className="w-full">
                
                  Visiter le site
                  <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </article>
          )}
        </div>

        <section className="mt-12 flex flex-col items-center gap-4 rounded-lg bg-black px-6 py-10 text-center">
          <h2 className="text-2xl font-bold text-white/95">
            Devenir partenaire de Sincery Prestations
          </h2>
          <p className="max-w-2xl text-base text-white/70">
            Vous êtes fabricant, distributeur ou prestataire technique et
            souhaitez collaborer avec nous ? Présentez-nous votre activité.
          </p>
          <Button to="/contact?sujet=Demande%20de%20partenariat">
            Devenir partenaire
          </Button>
        </section>
      </div>
    </>);

}