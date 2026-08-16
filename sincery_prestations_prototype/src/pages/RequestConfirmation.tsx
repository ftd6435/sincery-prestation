import React from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2Icon, MailIcon, PhoneIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { company } from '../data/company';
import { useSeo } from '../utils/seo';

interface ConfirmationState {
  reference?: string;
  email?: string;
  itemCount?: number;
}

export function RequestConfirmation({ type }: {type: 'devis' | 'commande';}) {
  const { state } = useLocation();
  const { reference, email, itemCount } = (state ?? {}) as ConfirmationState;

  const isQuote = type === 'devis';
  useSeo(
    isQuote ?
    'Demande de devis envoyée | Sincery Prestations' :
    'Commande enregistrée | Sincery Prestations',
    isQuote ?
    'Votre demande de devis a bien été transmise à Sincery Prestations.' :
    'Votre commande a bien été enregistrée auprès de Sincery Prestations.'
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-line bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success">
          <CheckCircle2Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-black/90">
          {isQuote ?
          'Votre demande de devis a bien été envoyée' :
          'Votre commande a bien été enregistrée'}
        </h1>
        <p className="mt-3 text-base text-black/65">
          {isQuote ?
          'Notre équipe commerciale étudie votre demande et vous transmet une proposition chiffrée sous 48 heures ouvrées.' :
          'Notre équipe commerciale vous recontacte pour confirmer la disponibilité, les modalités de livraison et de règlement. Aucun paiement en ligne n’est demandé.'}
        </p>

        <div className="mt-6 rounded-lg inset-panel p-5">
          <p className="text-sm text-black/65">
            {isQuote ? 'Numéro de devis' : 'Numéro de commande'}
          </p>
          <p className="mt-1 text-2xl font-bold text-brand">
            {reference ?? (isQuote ? 'DEV-2026-000000' : 'CMD-2026-000000')}
          </p>
          {typeof itemCount === 'number' &&
          <p className="mt-2 text-sm text-black/65">
              {itemCount} article{itemCount > 1 ? 's' : ''} concerné
              {itemCount > 1 ? 's' : ''}
            </p>
          }
        </div>

        <p className="mt-5 text-base text-black/65">
          Un email de confirmation a été envoyé
          {email ? ` à ${email}` : ''}. Conservez cette référence pour tout
          échange avec nos équipes.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/boutique">Continuer mes achats</Button>
          <Button to="/" variant="secondary">
            Retour à l’accueil
          </Button>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-4 border-t border-line pt-6 text-base text-black/65 sm:flex-row">
          <a
            href={`tel:${company.phone.replace(/\s/g, '')}`}
            className="flex items-center justify-center gap-2 hover:text-brand">
            
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            {company.phone}
          </a>
          <a
            href={`mailto:${company.email}`}
            className="flex items-center justify-center gap-2 hover:text-brand">
            
            <MailIcon className="h-4 w-4" aria-hidden="true" />
            {company.email}
          </a>
        </div>
      </div>
    </div>);

}