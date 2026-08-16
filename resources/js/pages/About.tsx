import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { categories } from '../data/categories';
import { company, values } from '../data/company';
import { useSeo } from '../utils/seo';

export function About() {
  useSeo(
    'À propos | Sincery Prestations',
    'Découvrez Sincery Prestations : notre mission, notre vision, nos valeurs et nos domaines d’activité dans la fourniture d’équipements professionnels.'
  );

  return (
    <>
      <PageHero
        title="À propos de Sincery Prestations"
        subtitle="Fournisseur d’équipements professionnels au service des entreprises, artisans et collectivités."
        crumbs={[{ label: 'À propos' }]} />


      <div className="mx-auto max-w-7xl px-6 py-12">
        <section aria-labelledby="qui-sommes-nous">
          <h2
            id="qui-sommes-nous"
            className="text-2xl font-bold text-black/90">

            Qui sommes-nous ?
          </h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <p className="text-base text-black/65">{company.intro}</p>
            <p className="text-base text-black/65">
              Nous intervenons auprès d’entreprises du bâtiment et des travaux
              publics, d’industriels, de sociétés de transport et de logistique,
              d’exploitations agricoles et de collectivités. Notre catalogue
              couvre l’équipement des personnes comme celui des sites et des
              machines, avec un interlocuteur unique pour l’ensemble de vos
              besoins.
            </p>
          </div>
        </section>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-line bg-white p-6 shadow-card">
            <h2 className="text-2xl font-bold text-black/90">Notre mission</h2>
            <p className="mt-3 text-base text-black/65">
              Rendre accessible aux professionnels un équipement conforme,
              fiable et adapté à leurs conditions de travail réelles, en
              simplifiant au maximum le parcours : consultation du catalogue,
              sélection, devis, commande.
            </p>
          </section>
          <section className="rounded-lg border border-line bg-white p-6 shadow-card">
            <h2 className="text-2xl font-bold text-black/90">Notre vision</h2>
            <p className="mt-3 text-base text-black/65">
              Devenir le partenaire de référence en équipement professionnel de
              notre région, reconnu pour la qualité de son conseil, la
              disponibilité de son stock et le respect systématique de ses
              engagements.
            </p>
          </section>
        </div>

        <section aria-labelledby="valeurs" className="mt-12">
          <h2 id="valeurs" className="text-2xl font-bold text-black/90">
            Nos valeurs
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) =>
            <li
              key={value.title}
              className="rounded-lg border border-line bg-white p-4 shadow-card">

                <span className="flex h-9 w-9 items-center justify-center rounded-full inset-panel text-brand">
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-lg font-semibold text-black/90">
                  {value.title}
                </h3>
                <p className="mt-1 text-sm text-black/65">{value.text}</p>
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="domaines" className="mt-12">
          <h2 id="domaines" className="text-2xl font-bold text-black/90">
            Nos domaines d’activité
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) =>
            <article
              key={category.slug}
              className="rounded-lg border border-line bg-white p-4 shadow-card">

                <h3 className="text-lg font-semibold text-black/90">
                  {category.name}
                </h3>
                <p className="mt-1.5 text-sm text-black/65">
                  {category.description}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-black/45">
                  {category.children?.map((child) =>
                <li key={child.slug}>— {child.name}</li>
                )}
                </ul>
                <Link
                to={`/boutique/${category.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-base font-semibold text-brand hover:text-brand-dark">

                  Voir les produits
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            )}
          </div>
        </section>

        <section className="mt-12 flex flex-col items-center gap-4 rounded-lg inset-panel px-6 py-10 text-center">
          <h2 className="text-2xl font-bold text-black/90">
            Un besoin précis à équiper ?
          </h2>
          <p className="max-w-2xl text-base text-black/65">
            Nos équipes vous accompagnent dans le choix des références et
            établissent votre devis sous 48 heures ouvrées.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/devis">Demander un devis</Button>
            <Button to="/contact" variant="secondary">
              Nous contacter
            </Button>
          </div>
        </section>
      </div>
    </>);

}
