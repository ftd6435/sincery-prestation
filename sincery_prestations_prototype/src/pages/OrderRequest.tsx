import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon } from 'lucide-react';
import type { CustomerInfo } from '../types/content';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { SelectionRecap } from '../components/SelectionRecap';
import {
  CustomerFields,
  emptyCustomer,
  validateCustomer } from
'../components/forms/CustomerFields';
import { SelectField } from '../components/forms/Field';
import { useSelection } from '../contexts/SelectionContext';
import { generateReference } from '../utils/format';
import { useSeo } from '../utils/seo';

const steps = [
'Ma sélection',
'Informations client',
'Confirmation'];


export function OrderRequest() {
  const [values, setValues] = useState<CustomerInfo>(emptyCustomer);
  const [delivery, setDelivery] = useState('');
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerInfo, string>>>(
    {});
  const [submitting, setSubmitting] = useState(false);
  const { lines, count, clear } = useSelection();
  const navigate = useNavigate();

  useSeo(
    'Passer une commande | Sincery Prestations',
    'Enregistrez votre commande auprès de Sincery Prestations sans paiement en ligne. Nos équipes vous recontactent pour confirmer les modalités.'
  );

  function handleChange(field: keyof CustomerInfo, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateCustomer(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const reference = generateReference('CMD');
    window.setTimeout(() => {
      clear();
      navigate('/commande/confirmation', {
        state: { reference, email: values.email, itemCount: count }
      });
    }, 600);
  }

  return (
    <>
      <PageHero
        title="Passer une commande"
        subtitle="Commande sans paiement en ligne : vos informations sont transmises à notre équipe commerciale, qui confirme les modalités avec vous."
        crumbs={[{ label: 'Commande' }]} />
      

      <div className="mx-auto max-w-7xl px-6 py-8">
        <ol className="mb-6 flex flex-wrap items-center gap-3 text-base">
          {steps.map((step, index) =>
          <li key={step} className="flex items-center gap-2">
              <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
              index <= 1 ? 'bg-brand text-white' : 'bg-black/5 text-black/45'}`
              }>
              
                {index + 1}
              </span>
              <span
              className={index <= 1 ? 'text-black/90' : 'text-black/45'}>
              
                {step}
              </span>
              {index < steps.length - 1 &&
            <span aria-hidden="true" className="text-black/20">
                  ——
                </span>
            }
            </li>
          )}
        </ol>

        {lines.length === 0 ?
        <div className="rounded-lg border border-line bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-black/90">
              Votre sélection est vide
            </h2>
            <p className="mt-2 text-base text-black/65">
              Ajoutez au moins un produit à votre sélection pour passer
              commande.
            </p>
            <div className="mt-6 flex justify-center">
              <Button to="/boutique">Découvrir la boutique</Button>
            </div>
          </div> :

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          
            <div className="space-y-6">
              <section className="rounded-lg border border-line bg-white p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-black/90">
                  Produits commandés
                </h2>
                <div className="mt-4">
                  <SelectionRecap />
                </div>
              </section>

              <section className="rounded-lg border border-line bg-white p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-black/90">
                  Informations client
                </h2>
                <div className="mt-4">
                  <CustomerFields
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                  showPreferredContact={false}
                  commentLabel="Informations complémentaires"
                  extra={
                  <SelectField
                    label="Mode de livraison souhaité"
                    name="delivery"
                    className="sm:col-span-2"
                    value={delivery}
                    onChange={setDelivery}
                    options={[
                    'Retrait au dépôt',
                    'Livraison sur site',
                    'Livraison sur chantier',
                    'À définir avec le commercial']
                    } />

                  } />
                
                </div>
              </section>
            </div>

            <aside className="rounded-lg border border-line bg-white p-4 shadow-card">
              <h2 className="text-lg font-semibold text-black/90">
                Votre commande
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
                Aucun paiement en ligne n’est demandé. Un numéro de commande au
                format CMD-AAAA-NNNNNN vous sera communiqué.
              </p>
              <Button
              type="submit"
              className="mt-4 w-full"
              disabled={submitting}>
              
                <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
                {submitting ? 'Enregistrement…' : 'Confirmer ma commande'}
              </Button>
              <Button to="/ma-selection" variant="text" className="mt-3">
                Revenir à ma sélection
              </Button>
            </aside>
          </form>
        }
      </div>
    </>);

}