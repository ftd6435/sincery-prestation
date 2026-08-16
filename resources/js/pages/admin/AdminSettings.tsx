import { useState, type FormEvent } from 'react';
import { SaveIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { TextAreaField, TextField } from '../../components/forms/Field';
import { company } from '../../data/company';
import { useSeo } from '../../utils/seo';

export function AdminSettings() {
  const [values, setValues] = useState({
    phone: company.phone,
    email: company.email,
    address: company.address,
    linkedin: company.socials[0].url,
    facebook: company.socials[1].url,
    mapsKey: '',
    partnersIntro:
    'Nos partenariats garantissent la qualité des produits distribués, la disponibilité des références et l’accès à un support technique compétent.'
  });

  useSeo(
    'Paramètres | Administration Sincery Prestations',
    'Paramètres généraux du site : coordonnées, réseaux sociaux, contenus éditables et notifications.'
  );

  function change(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function save(e: FormEvent) {
    e.preventDefault();
    toast.success('Paramètres enregistrés');
  }

  return (
    <>
      <AdminPageHeader
        title="Paramètres"
        description="Coordonnées, contenus éditables et notifications du site." />


      <form onSubmit={save} className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <AdminCard className="p-5">
          <h2 className="text-lg font-semibold text-black/90">
            Coordonnées de l’entreprise
          </h2>
          <div className="mt-4 grid gap-4">
            <TextField
              label="Téléphone"
              name="phone"
              value={values.phone}
              onChange={(v) => change('phone', v)} />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={(v) => change('email', v)} />

            <TextField
              label="Adresse"
              name="address"
              value={values.address}
              onChange={(v) => change('address', v)} />

            <TextField
              label="Clé API Google Maps"
              name="mapsKey"
              value={values.mapsKey}
              onChange={(v) => change('mapsKey', v)}
              placeholder="Saisir la clé pour activer la carte personnalisée" />

          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h2 className="text-lg font-semibold text-black/90">
            Réseaux sociaux
          </h2>
          <div className="mt-4 grid gap-4">
            <TextField
              label="LinkedIn"
              name="linkedin"
              value={values.linkedin}
              onChange={(v) => change('linkedin', v)} />

            <TextField
              label="Facebook"
              name="facebook"
              value={values.facebook}
              onChange={(v) => change('facebook', v)} />

          </div>

          <h2 className="mt-6 text-lg font-semibold text-black/90">
            Contenu éditable
          </h2>
          <div className="mt-4">
            <TextAreaField
              label="Introduction de la page Partenaires"
              name="partnersIntro"
              rows={4}
              value={values.partnersIntro}
              onChange={(v) => change('partnersIntro', v)} />

          </div>
        </AdminCard>

        <AdminCard className="p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-black/90">Notifications</h2>
          <p className="mt-1 text-sm text-black/65">
            Emails envoyés automatiquement lors des événements du site.
          </p>
          <ul className="mt-4 divide-y divide-line">
            {[
            {
              event: 'Nouvelle demande de devis',
              target: 'Administrateur + accusé de réception client'
            },
            {
              event: 'Nouvelle commande',
              target: 'Administrateur + accusé de réception client'
            },
            {
              event: 'Nouveau message de contact',
              target: 'Administrateur'
            },
            {
              event: 'Changement de statut devis / commande',
              target: 'Client'
            }].
            map((item) =>
            <li
              key={item.event}
              className="flex flex-wrap items-center justify-between gap-3 py-3">

                <div>
                  <p className="text-base font-semibold text-black/90">
                    {item.event}
                  </p>
                  <p className="text-sm text-black/65">{item.target}</p>
                </div>
                <label className="flex items-center gap-2 text-base text-black/65">
                  <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[#C1272D]" />

                  Email activé
                </label>
              </li>
            )}
          </ul>
          <p className="mt-3 rounded-md inset-panel p-3 text-sm text-black/65">
            Notifications WhatsApp Business : prévues en version 2.
          </p>
          <div className="mt-5">
            <Button type="submit">
              <SaveIcon className="h-4 w-4" aria-hidden="true" />
              Enregistrer les paramètres
            </Button>
          </div>
        </AdminCard>
      </form>
    </>);

}
