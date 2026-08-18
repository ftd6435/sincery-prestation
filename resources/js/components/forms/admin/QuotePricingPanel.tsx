import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';
import { TextField } from '../Field';
import { PlusIcon, Trash2Icon } from 'lucide-react';

export interface QuoteItemInput {
  id: number;
  product_name: string;
  quantity: number;
  price?: number | null;
}

export interface QuotePricingFormValues {
  validity_date: string;
  items: {
    id: number;
    price: number;
    quantity: number;
  }[];
}

export interface QuotePricingPanelProps {
  quoteItems: QuoteItemInput[];
  onSubmitPricing: (values: QuotePricingFormValues) => void;
  submitting?: boolean;
}

const schema = z.object({
  validity_date: z.string().min(1, 'Date requise'),
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      price: z.coerce.number().min(0, 'Prix ≥ 0'),
      quantity: z.coerce.number().int().min(1, 'Quantité ≥ 1'),
    }),
  ),
});

function getDefaultValidityDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

function formatGnf(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuotePricingPanel({
  quoteItems,
  onSubmitPricing,
  submitting = false,
}: QuotePricingPanelProps) {
  const defaultItems = useMemo(
    () =>
      quoteItems.map((item) => ({
        id: item.id,
        price: item.price ?? 0,
        quantity: item.quantity ?? 1,
      })),
    [quoteItems],
  );

  const productNames = useMemo(() => {
    const map: Record<number, string> = {};
    quoteItems.forEach((item) => {
      map[item.id] = item.product_name;
    });
    return map;
  }, [quoteItems]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuotePricingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      validity_date: getDefaultValidityDate(),
      items: defaultItems,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    reset({
      validity_date: getDefaultValidityDate(),
      items: defaultItems,
    });
  }, [quoteItems, reset, defaultItems]);

  const watchedItems = watch('items');
  const watchedValidity = watch('validity_date');

  const hasPendingPricing = useMemo(
    () => watchedItems.some((it) => it.price == null || it.price === undefined || it.price === 0),
    [watchedItems],
  );

  const rowTotals = useMemo(
    () =>
      watchedItems.map((item) => {
        const qty = Number(item.quantity) || 0;
        const prc = Number(item.price) || 0;
        return Math.trunc(qty * prc);
      }),
    [watchedItems],
  );

  const subtotal = useMemo(
    () => rowTotals.reduce((acc, t) => acc + t, 0),
    [rowTotals],
  );

  return (
    <AdminCard className="p-5">
      <form onSubmit={handleSubmit(onSubmitPricing)} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-black/90">Tarification du devis</h3>
          {hasPendingPricing && (
            <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
              En attente de prix
            </span>
          )}
        </div>

        <div className="max-w-sm">
          <TextField
            label="Date de validité"
            name="validity_date"
            type="date"
            required
            value={watchedValidity}
            onChange={(v: string) =>
              setValue('validity_date', v, { shouldValidate: true })
            }
            error={errors.validity_date?.message as string ?? undefined}
          />
        </div>

        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[720px] text-left">
            <caption className="sr-only">Tarification des articles</caption>
            <thead className="bg-surface-alt text-sm text-black/65">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Produit
                </th>
                <th scope="col" className="px-4 py-3 font-medium w-36">
                  Quantité
                </th>
                <th scope="col" className="px-4 py-3 font-medium w-52">
                  Prix unitaire (GNF)
                </th>
                <th scope="col" className="px-4 py-3 font-medium w-44 text-right">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 font-medium w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="px-4 py-3">
                    <span className="text-base font-medium text-black/90">
                      {productNames[field.id] ?? `Article #${field.id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <TextField
                      name={`items.${index}.quantity`}
                      type="number"
                      min={1}
                      value={watchedItems[index]?.quantity ?? ''}
                      onChange={(v: string) =>
                        setValue(
                          `items.${index}.quantity`,
                          v ? Number(v) : 0 as any,
                          { shouldValidate: true },
                        )
                      }
                      error={
                        (errors.items as any)?.[index]?.quantity?.message as string ??
                        undefined
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <TextField
                      name={`items.${index}.price`}
                      type="number"
                      step="0.01"
                      min={0}
                      suffix="GNF"
                      value={watchedItems[index]?.price ?? ''}
                      onChange={(v: string) =>
                        setValue(
                          `items.${index}.price`,
                          v ? Number(v) : 0 as any,
                          { shouldValidate: true },
                        )
                      }
                      error={
                        (errors.items as any)?.[index]?.price?.message as string ??
                        undefined
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <span className="font-bold text-brand">
                      {formatGnf(rowTotals[index] ?? 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="Supprimer la ligne"
                      className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            iconLeft={<PlusIcon className="h-4 w-4" aria-hidden="true" />}
            onClick={() =>
              append({
                id: Date.now(),
                price: 0,
                quantity: 1,
              })
            }
          >
            Ajouter une ligne
          </Button>
        </div>

        <div className="ml-auto grid w-full max-w-xs gap-2 rounded-md border border-line bg-surface-alt p-4">
          <div className="flex items-center justify-between text-sm text-black/65">
            <span>Sous-total</span>
            <span className="text-lg font-bold text-brand">{formatGnf(subtotal)}</span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          >
            Valider le tarif
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
