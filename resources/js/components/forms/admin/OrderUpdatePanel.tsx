import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';
import {
  SelectField,
  TextAreaField,
  TextField,
} from '../Field';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { OrderStatus, OrderDeliveryMode } from '../../../types/admin';

export interface OrderProductOption {
  id: number;
  name: string;
  price?: number | null;
}

export interface OrderItemInput {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  price: number | null;
}

export interface OrderUpdateInput {
  status: OrderStatus;
  delivery_mode: OrderDeliveryMode;
  comment: string | null;
  internal_notes: string | null;
  items: OrderItemInput[];
}

export interface OrderUpdatePanelProps {
  order: {
    status: OrderStatus;
    delivery_mode: OrderDeliveryMode;
    comment: string | null;
    internal_notes?: string | null;
    items: OrderItemInput[];
  };
  products: OrderProductOption[];
  onSubmit: (values: OrderUpdateInput) => void;
  submitting?: boolean;
}

const statusOptions = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'canceled', label: 'Annulée' },
];

const deliveryOptions = [
  { value: 'Livraison', label: 'Livraison' },
  { value: 'Retrait boutique', label: 'Retrait boutique' },
];

const schema = z.object({
  status: z.enum(['new', 'pending', 'confirmed', 'delivered', 'canceled'], {
    required_error: 'Le statut est requis',
  }),
  delivery_mode: z.enum(['Livraison', 'Retrait boutique'], {
    required_error: 'Le mode de livraison est requis',
  }),
  comment: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        product_id: z.coerce
          .number({
            required_error: 'Produit requis',
            invalid_type_error: 'Produit requis',
          })
          .int()
          .positive('Produit requis'),
        quantity: z.coerce
          .number({
            required_error: 'Quantité requise',
            invalid_type_error: 'Quantité requise',
          })
          .int()
          .min(1, 'Quantité ≥ 1'),
        price: z.coerce
          .number({
            invalid_type_error: 'Prix invalide',
          })
          .min(0, 'Prix ≥ 0')
          .nullable()
          .optional(),
      }),
    )
    .min(1, 'Au moins un article est requis'),
});

function formatGnf(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderUpdatePanel({
  order,
  products,
  onSubmit,
  submitting = false,
}: OrderUpdatePanelProps) {
  const productMap = useMemo(() => {
    const map: Record<number, { name: string; price: number | null }> = {};
    products.forEach((p) => {
      map[p.id] = { name: p.name, price: p.price ?? null };
    });
    return map;
  }, [products]);

  const defaultItems = useMemo(
    () =>
      (order.items ?? []).map((item, idx) => ({
        id: item.id ?? idx + 1,
        product_id: item.product_id,
        quantity: item.quantity ?? 1,
        price: item.price ?? null,
      })),
    [order.items],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderUpdateInput>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      status: order.status,
      delivery_mode: order.delivery_mode,
      comment: order.comment ?? '',
      internal_notes: order.internal_notes ?? '',
      items: defaultItems,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    reset({
      status: order.status,
      delivery_mode: order.delivery_mode,
      comment: order.comment ?? '',
      internal_notes: order.internal_notes ?? '',
      items: defaultItems,
    });
  }, [order, reset, defaultItems]);

  const watchedItems = watch('items');

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
  }));

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Statut"
            name="status"
            required
            value={watch('status')}
            onChange={(v: string) =>
              setValue('status', v as OrderStatus, { shouldValidate: true })
            }
            error={errors.status?.message as string ?? undefined}
            options={statusOptions}
            emptyLabel={null}
          />

          <SelectField
            label="Mode de livraison"
            name="delivery_mode"
            required
            value={watch('delivery_mode')}
            onChange={(v: string) =>
              setValue('delivery_mode', v as OrderDeliveryMode, {
                shouldValidate: true,
              })
            }
            error={errors.delivery_mode?.message as string ?? undefined}
            options={deliveryOptions}
            emptyLabel={null}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextAreaField
            label="Commentaire client"
            name="comment"
            rows={3}
            placeholder="Commentaire visible par le client..."
            value={watch('comment') ?? ''}
            onChange={(v: string) =>
              setValue('comment', v || null as any, { shouldValidate: true })
            }
            error={errors.comment?.message as string ?? undefined}
          />

          <TextAreaField
            label="Notes internes"
            name="internal_notes"
            rows={3}
            placeholder="Notes internes (non visibles par le client)..."
            value={watch('internal_notes') ?? ''}
            onChange={(v: string) =>
              setValue('internal_notes', v || null as any, { shouldValidate: true })
            }
            error={errors.internal_notes?.message as string ?? undefined}
          />
        </div>

        <div>
          <h4 className="mb-3 text-base font-semibold text-black/90">Articles de la commande</h4>
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[800px] text-left">
              <caption className="sr-only">Articles de la commande</caption>
              <thead className="bg-surface-alt text-sm text-black/65">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Produit
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium w-36">
                    Quantité
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium w-48">
                    Prix unitaire (GNF)
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium w-40 text-right">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {fields.map((field, index) => {
                  const currentProductId = watchedItems[index]?.product_id;
                  const productInfo = currentProductId
                    ? productMap[currentProductId]
                    : null;

                  return (
                    <tr key={field.id}>
                      <td className="px-4 py-3">
                        <SelectField
                          name={`items.${index}.product_id`}
                          required
                          value={currentProductId ?? ''}
                          onChange={(v: string) => {
                            const pid = v ? Number(v) : null;
                            setValue(
                              `items.${index}.product_id`,
                              pid as any,
                              { shouldValidate: true },
                            );
                            if (pid && productMap[pid]?.price != null) {
                              setValue(
                                `items.${index}.price`,
                                productMap[pid].price as any,
                                { shouldValidate: true },
                              );
                            }
                            if (pid && productMap[pid]) {
                              // No product_name field in the schema, but tracked for UI
                            }
                          }}
                          error={
                            (errors.items as any)?.[index]?.product_id?.message as
                              | string
                              | undefined
                          }
                          options={productOptions}
                          emptyLabel="Sélectionner un produit"
                        />
                        {!currentProductId && (
                          <p className="mt-1 text-xs italic text-black/45">
                            {productInfo?.name ?? ''}
                          </p>
                        )}
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
                            (errors.items as any)?.[index]?.quantity?.message as
                              | string
                              | undefined
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
                              v ? Number(v) : null as any,
                              { shouldValidate: true },
                            )
                          }
                          error={
                            (errors.items as any)?.[index]?.price?.message as
                              | string
                              | undefined
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {errors.items && typeof errors.items === 'string' && (
            <p className="mt-1 text-sm text-danger">{errors.items as string}</p>
          )}
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
                product_id: null as any,
                product_name: '',
                quantity: 1,
                price: null,
              })
            }
          >
            Ajouter un article
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
            Mettre à jour la commande
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
