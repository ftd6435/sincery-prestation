import { useState } from 'react';
import { MailIcon } from 'lucide-react';
import type { ContactMessage } from '../../types/content';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatusBadge, type Tone } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { contactMessages } from '../../data/admin';
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

const labels: Record<ContactMessage['status'], string> = {
  nouveau: 'Nouveau',
  lu: 'Lu',
  traite: 'Traité'
};

const tones: Record<ContactMessage['status'], Tone> = {
  nouveau: 'info',
  lu: 'warning',
  traite: 'success'
};

export function AdminMessages() {
  const [rows, setRows] = useState<ContactMessage[]>(contactMessages);
  const [selectedId, setSelectedId] = useState<string>(contactMessages[0].id);

  useSeo(
    'Messages | Administration Sincery Prestations',
    'Consultation et traitement des messages reçus via le formulaire de contact.'
  );

  const selected = rows.find((m) => m.id === selectedId);

  function setStatus(id: string, status: ContactMessage['status']) {
    setRows((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
  }

  return (
    <>
      <AdminPageHeader
        title="Messages de contact"
        description="Messages reçus depuis le formulaire du site." />


      <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
        <AdminCard>
          <ul className="divide-y divide-line">
            {rows.map((message) =>
            <li key={message.id}>
                <button
                type="button"
                onClick={() => {
                  setSelectedId(message.id);
                  if (message.status === 'nouveau') setStatus(message.id, 'lu');
                }}
                aria-current={message.id === selectedId ? 'true' : undefined}
                className={`w-full px-4 py-3 text-left transition-colors ${
                message.id === selectedId ?
                'bg-[rgba(193,39,45,0.05)]' :
                'hover:bg-surface-alt'}`
                }>

                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-base font-semibold text-black/90">
                      {message.subject}
                    </span>
                    <StatusBadge tone={tones[message.status]}>
                      {labels[message.status]}
                    </StatusBadge>
                  </div>
                  <p className="truncate text-sm text-black/65">
                    {message.name} · {formatShortDate(message.date)}
                  </p>
                </button>
              </li>
            )}
          </ul>
        </AdminCard>

        {selected &&
        <AdminCard className="p-5">
            <h2 className="text-lg font-semibold text-black/90">
              {selected.subject}
            </h2>
            <p className="mt-1 text-sm text-black/45">
              {selected.name} · {selected.email}
              {selected.phone && ` · ${selected.phone}`} ·{' '}
              {formatShortDate(selected.date)}
            </p>
            <p className="mt-4 whitespace-pre-line text-base text-black/65">
              {selected.message}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
              size="sm"
              href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>

                <MailIcon className="h-4 w-4" aria-hidden="true" />
                Répondre par email
              </Button>
              <Button
              size="sm"
              variant="secondary"
              onClick={() => setStatus(selected.id, 'traite')}>

                Marquer comme traité
              </Button>
            </div>
          </AdminCard>
        }
      </div>
    </>);

}
