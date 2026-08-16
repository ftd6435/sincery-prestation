import { useState } from 'react';
import { EyeIcon, PrinterIcon } from 'lucide-react';
import type { AdminOrder, OrderStatus } from '../../types/content';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  adminOrders,
  orderStatusLabels,
  orderStatusTones } from
'../../data/admin';
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

const statuses = Object.keys(orderStatusLabels) as OrderStatus[];

export function AdminOrders() {
  const [rows, setRows] = useState<AdminOrder[]>(adminOrders);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [note, setNote] = useState('');

  useSeo(
    'Commandes | Administration Sincery Prestations',
    'Suivi des commandes enregistrées sans paiement en ligne : statuts, détails clients et notes internes.'
  );

  const visible = filter ? rows.filter((o) => o.status === filter) : rows;

  function updateStatus(id: string, status: OrderStatus) {
    setRows((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    setSelected((prev) => prev && prev.id === id ? { ...prev, status } : prev);
  }

  return (
    <>
      <AdminPageHeader
        title="Commandes"
        description="Commandes enregistrées via le site, sans paiement en ligne." />


      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filter === ''}
          onClick={() => setFilter('')}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
          filter === '' ?
          'bg-brand text-white' :
          'border border-line bg-white text-black/65 hover:border-brand hover:text-brand'}`
          }>

          Toutes ({rows.length})
        </button>
        {statuses.map((status) =>
        <button
          key={status}
          type="button"
          aria-pressed={filter === status}
          onClick={() => setFilter(status)}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
          filter === status ?
          'bg-brand text-white' :
          'border border-line bg-white text-black/65 hover:border-brand hover:text-brand'}`
          }>

            {orderStatusLabels[status]}
          </button>
        )}
      </div>

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <caption className="sr-only">Liste des commandes</caption>
            <thead className="bg-surface-alt text-sm text-black/65">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  N° commande
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Client
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Produits
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((order) =>
              <tr key={order.id}>
                  <td className="px-4 py-3 text-base font-semibold text-black/90">
                    {order.reference}
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {order.customer}
                    <span className="block text-sm text-black/45">
                      {order.company}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {formatShortDate(order.date)}
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {order.itemCount}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={orderStatusTones[order.status]}>
                      {orderStatusLabels[order.status]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                    type="button"
                    onClick={() => setSelected(order)}
                    className="flex items-center gap-1.5 text-base font-semibold text-brand hover:text-brand-dark">

                      <EyeIcon className="h-4 w-4" aria-hidden="true" />
                      Détail
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {selected &&
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="commande-detail"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-elevated">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2
              id="commande-detail"
              className="text-lg font-semibold text-black/90">

                Commande {selected.reference}
              </h2>
              <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-base text-black/45 hover:text-brand">

                Fermer
              </button>
            </div>

            <div className="space-y-5 p-5">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-black/45">Client</dt>
                  <dd className="text-base font-semibold text-black/90">
                    {selected.customer}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-black/45">Entreprise</dt>
                  <dd className="text-base font-semibold text-black/90">
                    {selected.company}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-black/45">Date</dt>
                  <dd className="text-base text-black/90">
                    {formatShortDate(selected.date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-black/45">Articles</dt>
                  <dd className="text-base text-black/90">
                    {selected.itemCount}
                  </dd>
                </div>
              </dl>

              <div>
                <label
                htmlFor="statut"
                className="mb-1.5 block text-sm text-black/65">

                  Statut de la commande
                </label>
                <select
                id="statut"
                value={selected.status}
                onChange={(e) =>
                updateStatus(selected.id, e.target.value as OrderStatus)
                }
                className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-brand">

                  {statuses.map((status) =>
                <option key={status} value={status}>
                      {orderStatusLabels[status]}
                    </option>
                )}
                </select>
              </div>

              <div>
                <label
                htmlFor="note"
                className="mb-1.5 block text-sm text-black/65">

                  Note interne
                </label>
                <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note visible uniquement par l’équipe."
                className="w-full rounded-md border border-line px-3 py-2.5 text-base outline-none focus:border-brand" />

              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setSelected(null)}>
                  Enregistrer
                </Button>
                <Button
                size="sm"
                variant="secondary"
                onClick={() => window.print()}>

                  <PrinterIcon className="h-4 w-4" aria-hidden="true" />
                  Imprimer la commande
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    </>);

}
