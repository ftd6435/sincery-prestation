import React from 'react';
import { ArrowLeftIcon, FileTextIcon, ShoppingBagIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { SelectionRecap } from '../components/SelectionRecap';
import { useSelection } from '../contexts/SelectionContext';
import { useSeo } from '../utils/seo';

export function Selection() {
  const { lines, count, clear } = useSelection();

  useSeo(
    'Ma sélection | Sincery Prestations',
    'Consultez les produits de votre sélection, ajustez les quantités puis demandez un devis ou passez commande sans paiement en ligne.'
  );

  return (
    <>
      <PageHero
        title="Ma sélection"
        subtitle="Votre liste de produits. Ajustez les quantités, puis demandez un devis ou passez une commande — aucun paiement en ligne."
        crumbs={[{ label: 'Ma sélection' }]} />
      

      <div className="mx-auto max-w-7xl px-6 py-8">
        {lines.length === 0 ?
        <div className="rounded-lg border border-line bg-white p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full inset-panel text-brand">
              <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-black/90">
              Votre sélection est vide
            </h2>
            <p className="mx-auto mt-2 max-w-md text-base text-black/65">
              Parcourez le catalogue et ajoutez les produits qui vous
              intéressent pour obtenir un chiffrage.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to="/boutique">Découvrir la boutique</Button>
              <Button to="/contact" variant="secondary">
                Décrire mon besoin
              </Button>
            </div>
          </div> :

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <SelectionRecap />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Button to="/boutique" variant="text">
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                  Continuer mes achats
                </Button>
                <button
                type="button"
                onClick={clear}
                className="text-base text-black/45 hover:text-danger">
                
                  Vider ma sélection
                </button>
              </div>
            </div>

            <aside className="rounded-lg border border-line bg-white p-4 shadow-card">
              <h2 className="text-lg font-semibold text-black/90">
                Récapitulatif
              </h2>
              <dl className="mt-3 space-y-2 text-base">
                <div className="flex justify-between">
                  <dt className="text-black/65">Références</dt>
                  <dd className="font-semibold">{lines.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-black/65">Articles</dt>
                  <dd className="font-semibold">{count}</dd>
                </div>
              </dl>
              <p className="mt-3 rounded-md inset-panel p-3 text-sm text-black/65">
                Les prix affichés sont indicatifs. Le montant définitif est
                confirmé dans votre devis.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button to="/devis">
                  <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                  Demander un devis
                </Button>
                <Button to="/commande" variant="secondary">
                  Passer une commande
                </Button>
              </div>
            </aside>
          </div>
        }
      </div>
    </>);

}