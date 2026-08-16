import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2Icon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  SendIcon } from
'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/forms/Field';
import { company } from '../data/company';
import { useSeo } from '../utils/seo';

interface ContactValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function Contact() {
  const [params] = useSearchParams();
  const [values, setValues] = useState<ContactValues>({
    name: '',
    email: '',
    phone: '',
    subject: params.get('sujet') ?? '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<ContactValues>>({});
  const [sent, setSent] = useState(false);

  useSeo(
    'Contact | Sincery Prestations',
    'Contactez Sincery Prestations : téléphone, email, adresse et formulaire de contact pour toute demande d’équipement professionnel ou de partenariat.'
  );

  function change(field: keyof ContactValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Partial<ContactValues> = {};
    if (!values.name.trim()) found.name = 'Ce champ est obligatoire.';
    if (!values.email.trim()) found.email = 'Ce champ est obligatoire.';else
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    found.email = 'Adresse email invalide.';
    if (!values.subject.trim()) found.subject = 'Ce champ est obligatoire.';
    if (!values.message.trim()) found.message = 'Ce champ est obligatoire.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSent(true);
  }

  const mapsQuery = encodeURIComponent(company.address);

  return (
    <>
      <PageHero
        title="Contact"
        subtitle="Une question, un besoin d’équipement ou une demande de partenariat ? Notre équipe vous répond."
        crumbs={[{ label: 'Contact' }]} />
      

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="rounded-lg border border-line bg-white p-4 shadow-card sm:p-6">
          <h2 className="text-lg font-semibold text-black/90">
            Nous écrire
          </h2>

          {sent ?
          <div
            role="status"
            className="mt-4 rounded-lg bg-success-bg p-6 text-center">
            
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-success">
                <CheckCircle2Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-lg font-semibold text-black/90">
                Message envoyé
              </h3>
              <p className="mt-2 text-base text-black/65">
                Merci {values.name}. Nous revenons vers vous sous 48 heures
                ouvrées à l’adresse {values.email}.
              </p>
              <Button
              variant="secondary"
              className="mt-5"
              onClick={() => {
                setSent(false);
                setValues({
                  name: '',
                  email: '',
                  phone: '',
                  subject: '',
                  message: ''
                });
              }}>
              
                Envoyer un autre message
              </Button>
            </div> :

          <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField
              label="Nom"
              name="name"
              required
              value={values.name}
              error={errors.name}
              onChange={(v) => change('name', v)} />
            
              <TextField
              label="Email"
              name="email"
              type="email"
              required
              value={values.email}
              error={errors.email}
              onChange={(v) => change('email', v)} />
            
              <TextField
              label="Téléphone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={(v) => change('phone', v)} />
            
              <TextField
              label="Sujet"
              name="subject"
              required
              value={values.subject}
              error={errors.subject}
              onChange={(v) => change('subject', v)}
              placeholder="Demande d’information, partenariat…" />
            
              <TextAreaField
              label="Message"
              name="message"
              required
              rows={6}
              className="sm:col-span-2"
              value={values.message}
              error={errors.message}
              onChange={(v) => change('message', v)} />
            
              <div className="sm:col-span-2">
                <Button type="submit">
                  <SendIcon className="h-4 w-4" aria-hidden="true" />
                  Envoyer le message
                </Button>
              </div>
            </form>
          }
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-black/90">
              Coordonnées
            </h2>
            <ul className="mt-4 space-y-3 text-base text-black/65">
              <li className="flex items-start gap-2.5">
                <MapPinIcon
                  className="mt-1 h-4 w-4 shrink-0 text-brand"
                  aria-hidden="true" />
                
                {company.address}
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon
                  className="mt-1 h-4 w-4 shrink-0 text-brand"
                  aria-hidden="true" />
                
                <a
                  href={`tel:${company.phone.replace(/\s/g, '')}`}
                  className="hover:text-brand">
                  
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MailIcon
                  className="mt-1 h-4 w-4 shrink-0 text-brand"
                  aria-hidden="true" />
                
                <a
                  href={`mailto:${company.email}`}
                  className="hover:text-brand">
                  
                  {company.email}
                </a>
              </li>
            </ul>

            <h3 className="mt-5 flex items-center gap-2 text-base font-semibold text-black/90">
              <ClockIcon className="h-4 w-4 text-brand" aria-hidden="true" />
              Horaires
            </h3>
            <dl className="mt-2 space-y-1 text-base text-black/65">
              {company.hours.map((h) =>
              <div key={h.day} className="flex justify-between gap-4">
                  <dt>{h.day}</dt>
                  <dd className="font-semibold text-black/90">{h.value}</dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {company.socials.map((s) =>
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-md border border-line px-3 py-1.5 text-sm text-black/65 hover:border-brand hover:text-brand">
                
                  {s.name}
                </a>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
            <iframe
              title="Localisation de Sincery Prestations"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              loading="lazy"
              className="h-56 w-full border-0" />
            
            <div className="p-4">
              <Button
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
                target="_blank"
                rel="noreferrer noopener"
                variant="secondary"
                size="sm"
                className="w-full">
                
                <NavigationIcon className="h-4 w-4" aria-hidden="true" />
                Itinéraire
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </>);

}