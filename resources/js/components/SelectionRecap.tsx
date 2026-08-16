import { Trash2Icon } from 'lucide-react';
import { useSelection } from '../contexts/SelectionContext';
import { formatPrice } from '../utils/format';
import { QuantityStepper } from './QuantityStepper';

export function SelectionRecap({ editable = true }: {editable?: boolean;}) {
  const { lines, setQuantity, remove } = useSelection();

  if (lines.length === 0) {
    return (
      <p className="rounded-lg border border-line bg-white p-4 text-base text-black/65">
        Aucun produit sélectionné pour le moment.
      </p>);

  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full text-left">
        <caption className="sr-only">
          Récapitulatif des produits sélectionnés
        </caption>
        <thead className="bg-surface-alt text-sm text-black/65">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Produit
            </th>
            <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
              Référence
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Quantité
            </th>
            <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
              Prix unitaire
            </th>
            {editable && <th scope="col" className="w-12 px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {lines.map((line) =>
          <tr key={line.productId} className="align-middle">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                  src={line.product.images[0]}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 rounded-lg border border-line object-cover" />

                  <span className="text-base font-semibold text-black/90">
                    {line.product.name}
                  </span>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-sm text-black/65 sm:table-cell">
                {line.product.sku}
              </td>
              <td className="px-4 py-3">
                {editable ?
              <QuantityStepper
                value={line.quantity}
                onChange={(q) => setQuantity(line.productId, q)} /> :


              <span className="text-base font-semibold">
                    {line.quantity}
                  </span>
              }
              </td>
              <td className="hidden px-4 py-3 text-base font-semibold text-brand md:table-cell">
                {formatPrice(line.product.price)}
              </td>
              {editable &&
            <td className="px-4 py-3">
                  <button
                type="button"
                onClick={() => remove(line.productId)}
                aria-label={`Retirer ${line.product.name} de ma sélection`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-danger-bg hover:text-danger">

                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
            }
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}
