import React, { useState } from 'react';
import { DownloadIcon, EyeIcon } from 'lucide-react';
import type { AdminQuote, QuoteStatus } from '../../types/content';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  adminQuotes,
  quoteStatusLabels,
  quoteStatusTones } from
'../../data/admin';
import { products } from '../../data/products';
import { formatPrice, formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

const statuses = Object.keys(quoteStatusLabels) as QuoteStatus[];

export function AdminQuotes() {
  const [rows, setRows] = useState<AdminQuote[]>(adminQuotes);
  const [selected, setSelected] = useState<AdminQuote | null>(null);

  useSeo(
    'Devis | Administration Sincery Prestations',
    'Suivi des demandes de devis : statuts, détail des produits demandés et génération du devis PDF.'
  );

  function updateStatus(id: string, status: QuoteStatus) {
    setRows((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    setSelected((prev) => prev && prev.id === id ? { ...prev, status } : prev);
  }

  const quoteLines = products.slice(0, 3);
  const subtotal = quoteLines.reduce((sum, p) => sum + (p.price ?? 0), 0);

  return (
    <>
      <AdminPageHeader
        title="Demandes de devis"
        description="Traitez les demandes reçues et générez les devis au format PDF." />
      

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <caption className="sr-only">Liste des demandes de devis</caption>
            <thead className="bg-surface-alt text-sm text-black/65">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  N° devis
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
              {rows.map((quote) =>
              <tr key={quote.id}>
                  <td className="px-4 py-3 text-base font-semibold text-black/90">
                    {quote.reference}
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {quote.customer}
                    <span className="block text-sm text-black/45">
                      {quote.company}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {formatShortDate(quote.date)}
                  </td>
                  <td className="px-4 py-3 text-base text-black/65">
                    {quote.itemCount}
                  </td>
                  <td className="px-4 py-3">
                    <select
                    value={quote.status}
                    aria-label={`Statut du devis ${quote.reference}`}
                    onChange={(e) =>
                    updateStatus(quote.id, e.target.value as QuoteStatus)
                    }
                    className="rounded-md border border-line bg-white px-2 py-1.5 text-sm outline-none focus:border-brand">
                    
                      {statuses.map((status) =>
                    <option key={status} value={status}>
                          {quoteStatusLabels[status]}
                        </option>
                    )}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                    type="button"
                    onClick={() => setSelected(quote)}
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
        aria-labelledby="devis-detail"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6">
        
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-elevated">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2
                id="devis-detail"
                className="text-lg font-semibold text-black/90">
                
                  Devis {selected.reference}
                </h2>
                <p className="text-sm text-black/45">
                  Émis le {formatShortDate(selected.date)} — validité 30 jours
                </p>
              </div>
              <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-base text-black/45 hover:text-brand">
              
                Fermer
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-lg inset-panel p-4">
                <p className="text-sm text-black/45">Client</p>
                <p className="text-base font-semibold text-black/90">
                  {selected.customer} — {selected.company}
                </p>
                <p className="text-sm text-black/65">
                  contact@exemple.com · +225 07 00 00 00
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[520px] text-left">
                  <caption className="sr-only">
                    Produits inclus dans le devis
                  </caption>
                  <thead className="bg-surface-alt text-sm text-black/65">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Référence
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Désignation
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Qté
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Prix
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {quoteLines.map((product) =>
                  <tr key={product.id}>
                        <td className="px-4 py-2.5 text-base text-black/65">
                          {product.sku}
                        </td>
                        <td className="px-4 py-2.5 text-base text-black/90">
                          {product.name}
                        </td>
                        <td className="px-4 py-2.5 text-base text-black/65">
                          1
                        </td>
                        <td className="px-4 py-2.5 text-base font-semibold text-black/90">
                          {formatPrice(product.price)}
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>

              <dl className="ml-auto w-full max-w-xs space-y-1.5 text-base">
                <div className="flex justify-between">
                  <dt className="text-black/65">Sous-total</dt>
                  <dd className="font-semibold">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-black/65">Remise</dt>
                  <dd className="font-semibold">0 F CFA</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-black/65">Taxes (18 %)</dt>
                  <dd className="font-semibold">
                    {formatPrice(Math.round(subtotal * 0.18))}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2">
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-xl font-bold text-brand">
                    {formatPrice(Math.round(subtotal * 1.18))}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                <Button size="sm">
                  <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                  Générer le devis PDF
                </Button>
                <Button
                size="sm"
                variant="secondary"
                onClick={() => updateStatus(selected.id, 'envoye')}>
                
                  Marquer comme envoyé
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    </>);

}