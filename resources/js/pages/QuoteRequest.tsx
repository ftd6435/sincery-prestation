import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon, InfoIcon } from 'lucide-react';
import type { CustomerInfo } from '../types/content';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { SelectionRecap } from '../components/SelectionRecap';
import {
  CustomerFields,
  emptyCustomer,
  validateCustomer } from
'../components/forms/CustomerFields';
import { useSelection } from '../contexts/SelectionContext';
import { generateReference } from '../utils/format';
import { useSeo } from '../utils/seo';

export function QuoteRequest() {
  const [values, setValues] = useState<CustomerInfo>(emptyCustomer);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerInfo, string>>>(
    {});
  const [submitting, setSubmitting] = useState(false);
  const { lines, count, clear } = useSelection();
  const navigate = useNavigate();

  useSeo(
    'Demander un devis | Sincery Prestations',
    'Constituez votre sélection de produits et recevez une proposition chiffrée de Sincery Prestations sous 48 heures ouvrées.'
  );

  function handleChange(field: keyof CustomerInfo, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateCustomer(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const reference = generateReference('DEV');
    window.setTimeout(() => {
      clear();
      navigate('/devis/confirmation', {
        state: { reference, email: values.email, itemCount: count }
      });
    }, 600);
  }

  return (
    <>
      <PageHero
        title="Demander un devis"
        subtitle="Renseignez vos coordonnées : nous revenons vers vous avec une proposition chiffrée sous 48 heures ouvrées."
        crumbs={[{ label: 'Demander un devis' }]} />


      <div className="mx-auto max-w-7xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">

          <div className="space-y-6">
            <section className="rounded-lg border border-line bg-white p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-black/90">
                Produits concernés
              </h2>
              <p className="mt-1 text-sm text-black/65">
                Vous pouvez encore ajuster les quantités avant l’envoi.
              </p>
              <div className="mt-4">
                <SelectionRecap />
              </div>
              {lines.length === 0 &&
              <p className="mt-3 flex items-start gap-2 text-sm text-black/65">
                  <InfoIcon
                  className="mt-0.5 h-4 w-4 shrink-0 text-info"
                  aria-hidden="true" />

                  Aucun produit sélectionné : décrivez votre besoin dans le
                  champ commentaire, nous vous proposerons des références.
                </p>
              }
            </section>

            <section className="rounded-lg border border-line bg-white p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-black/90">
                Vos coordonnées
              </h2>
              <div className="mt-4">
                <CustomerFields
                  values={values}
                  errors={errors}
                  onChange={handleChange} />

              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-line bg-white p-4 shadow-card">
            <h2 className="text-lg font-semibold text-black/90">
              Votre demande
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
              Aucun paiement en ligne. Vous recevrez un numéro de devis au
              format DEV-AAAA-NNNNNN ainsi qu’un email de confirmation.
            </p>
            <Button type="submit" className="mt-4 w-full" disabled={submitting}>
              <FileTextIcon className="h-4 w-4" aria-hidden="true" />
              {submitting ? 'Envoi en cours…' : 'Envoyer ma demande de devis'}
            </Button>
            <Button to="/ma-selection" variant="text" className="mt-3">
              Revenir à ma sélection
            </Button>
          </aside>
        </form>
      </div>
    </>);

}
