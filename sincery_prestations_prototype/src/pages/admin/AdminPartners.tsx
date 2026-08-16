import React, { useState } from 'react';
import { GripVerticalIcon, PencilIcon, PlusIcon, StarIcon } from 'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { partners } from '../../data/partners';
import { useSeo } from '../../utils/seo';

export function AdminPartners() {
  const [rows, setRows] = useState(partners);

  useSeo(
    'Partenaires | Administration Sincery Prestations',
    'Gestion des partenaires affichés sur le site : logo, description, ordre et mise en avant.'
  );

  function toggleActive(id: string) {
    setRows((prev) =>
    prev.map((p) => p.id === id ? { ...p, active: !p.active } : p)
    );
  }

  function setFeatured(id: string) {
    setRows((prev) => prev.map((p) => ({ ...p, featured: p.id === id })));
  }

  return (
    <>
      <AdminPageHeader
        title="Partenaires"
        description="Ajoutez, ordonnez et mettez en avant les partenaires de l’entreprise."
        actions={
        <Button size="sm">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Ajouter un partenaire
          </Button>
        } />
      

      <AdminCard>
        <ul className="divide-y divide-line">
          {rows.
          slice().
          sort((a, b) => a.order - b.order).
          map((partner) =>
          <li
            key={partner.id}
            className="flex flex-wrap items-center gap-4 p-4">
            
                <span className="text-black/20" aria-label="Réorganiser">
                  <GripVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-lg inset-panel text-base font-bold text-brand">
                  {partner.logoText}
                </span>
                <div className="min-w-[200px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-black/90">
                      {partner.name}
                    </h2>
                    {partner.featured &&
                <StatusBadge tone="warning">
                        <StarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        À la une
                      </StatusBadge>
                }
                    <StatusBadge tone={partner.active ? 'success' : 'neutral'}>
                      {partner.active ? 'Actif' : 'Désactivé'}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-black/65">
                    {partner.category} · {partner.sector} · {partner.city},{' '}
                    {partner.country}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                size="sm"
                variant="secondary"
                onClick={() => setFeatured(partner.id)}>
                
                    Mettre à la une
                  </Button>
                  <Button
                size="sm"
                variant="secondary"
                onClick={() => toggleActive(partner.id)}>
                
                    {partner.active ? 'Désactiver' : 'Activer'}
                  </Button>
                  <button
                type="button"
                aria-label={`Modifier ${partner.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-surface-alt hover:text-brand">
                
                    <PencilIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
          )}
        </ul>
      </AdminCard>
    </>);

}