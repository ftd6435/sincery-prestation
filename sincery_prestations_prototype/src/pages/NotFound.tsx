import React from 'react';
import { Button } from '../components/ui/Button';
import { useSeo } from '../utils/seo';

export function NotFound() {
  useSeo(
    'Page introuvable | Sincery Prestations',
    'La page demandée n’existe pas ou a été déplacée.'
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-xl font-bold text-brand">Erreur 404</p>
      <h1 className="mt-2 text-2xl font-bold text-black/90 sm:text-4xl">
        Page introuvable
      </h1>
      <p className="mt-3 text-base text-black/65">
        La page que vous recherchez n’existe pas ou a été déplacée.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to="/">Retour à l’accueil</Button>
        <Button to="/boutique" variant="secondary">
          Voir la boutique
        </Button>
      </div>
    </div>);

}