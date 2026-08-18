import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';
import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
} from '../Field';

export interface ProductCategoryOption {
  id: number | string;
  name: string;
}

export interface ProductFormValues {
  category_id: number;
  reference: string | null;
  name: string;
  short_description: string;
  description: string | null;
  price: number | null;
  unit: string;
  stock: number;
  low_stock_threshold: number;
  quote_only: boolean;
  featured: boolean;
  available: boolean;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  thumbnail: File | null;
  thumbnail_preview?: string | null;
}

export type PartialProductFormValues = Partial<ProductFormValues>;

const productSchema = z.object({
  category_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(1, 'La catégorie est requise'),
  ),
  reference: z.string().nullable().optional(),
  name: z
    .string({ required_error: 'Le nom est requis' })
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  short_description: z
    .string({ required_error: 'La description courte est requise' })
    .min(3, 'La description courte doit contenir au moins 3 caractères'),
  description: z.string().nullable().optional(),
  price: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z
      .number({ invalid_type_error: 'Le prix doit être un nombre' })
      .positive('Le prix doit être positif')
      .nullable(),
  ),
  unit: z.string().default('Unité'),
  stock: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, 'Le stock doit être supérieur ou égal à 0'),
  ),
  low_stock_threshold: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 5 : Number(v)),
    z
      .number()
      .int()
      .min(0, 'Le seuil de stock bas doit être supérieur ou égal à 0'),
  ),
  quote_only: z.boolean(),
  featured: z.boolean(),
  available: z.boolean(),
  published: z.boolean(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  thumbnail: z.instanceof(File).nullable().optional(),
});

const defaultValues: ProductFormValues = {
  category_id: 0,
  reference: null,
  name: '',
  short_description: '',
  description: null,
  price: null,
  unit: 'Unité',
  stock: 0,
  low_stock_threshold: 5,
  quote_only: false,
  featured: false,
  available: true,
  published: true,
  meta_title: null,
  meta_description: null,
  thumbnail: null,
  thumbnail_preview: null,
};

export interface ProductFormProps {
  initialValues?: PartialProductFormValues;
  categories: ProductCategoryOption[];
  onSubmit: (values: ProductFormValues) => void;
  submitting?: boolean;
}

export function ProductForm({
  initialValues,
  categories,
  onSubmit,
  submitting = false,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialValues?.thumbnail_preview ?? null,
  );

  useEffect(() => {
    const merged: ProductFormValues = {
      ...defaultValues,
      ...initialValues,
    };
    form.reset(merged);
    setThumbnailPreview(initialValues?.thumbnail_preview ?? null);
  }, [initialValues, form]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(initialValues?.thumbnail_preview ?? null);
    }
    form.setValue('thumbnail', file, { shouldValidate: true });
  };

  const clearThumbnail = () => {
    form.setValue('thumbnail', null, { shouldValidate: true });
    setThumbnailPreview(initialValues?.thumbnail_preview ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as ProductFormValues);
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <AdminCard className="p-5">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Catégorie"
            name="category_id"
            required
            emptyLabel="Sélectionner une catégorie"
            options={categoryOptions}
            value={form.watch('category_id') === 0 ? '' : form.watch('category_id') ?? ''}
            onChange={(v: string) =>
              form.setValue('category_id', v === '' ? 0 : Number(v), {
                shouldValidate: true,
              })
            }
            error={form.formState.errors.category_id?.message as string ?? undefined}
          />

          <TextField
            label="Référence"
            name="reference"
            placeholder="Ex : PROD-001"
            value={form.watch('reference') ?? ''}
            onChange={(v: string) =>
              form.setValue('reference', v || null, { shouldValidate: true })
            }
            error={form.formState.errors.reference?.message as string ?? undefined}
          />

          <TextField
            label="Nom"
            name="name"
            required
            placeholder="Nom du produit"
            value={form.watch('name')}
            onChange={(v: string) => form.setValue('name', v, { shouldValidate: true })}
            error={form.formState.errors.name?.message as string ?? undefined}
          />

          <TextField
            label="Prix"
            name="price"
            type="number"
            step="0.01"
            suffix="GNF"
            placeholder="0"
            value={form.watch('price') ?? ''}
            onChange={(v: string) =>
              form.setValue(
                'price',
                v === '' || v === null ? null : Number(v),
                { shouldValidate: true },
              )
            }
            error={form.formState.errors.price?.message as string ?? undefined}
          />

          <TextField
            label="Unité"
            name="unit"
            required
            placeholder="Ex : Unité, m², kg"
            value={form.watch('unit')}
            onChange={(v: string) => form.setValue('unit', v, { shouldValidate: true })}
            error={form.formState.errors.unit?.message as string ?? undefined}
          />

          <TextField
            label="Stock"
            name="stock"
            type="number"
            placeholder="0"
            value={form.watch('stock')}
            onChange={(v: string) =>
              form.setValue('stock', Number(v) || 0, { shouldValidate: true })
            }
            error={form.formState.errors.stock?.message as string ?? undefined}
          />

          <TextField
            label="Seuil stock bas"
            name="low_stock_threshold"
            type="number"
            placeholder="5"
            value={form.watch('low_stock_threshold')}
            onChange={(v: string) =>
              form.setValue('low_stock_threshold', Number(v) || 0, {
                shouldValidate: true,
              })
            }
            error={form.formState.errors.low_stock_threshold?.message as string ?? undefined}
          />

          <TextField
            label="Description courte"
            name="short_description"
            required
            className="sm:col-span-2"
            placeholder="Brève description du produit"
            value={form.watch('short_description')}
            onChange={(v: string) =>
              form.setValue('short_description', v, { shouldValidate: true })
            }
            error={form.formState.errors.short_description?.message as string ?? undefined}
          />

          <TextAreaField
            label="Description"
            name="description"
            rows={6}
            className="sm:col-span-2"
            placeholder="Description détaillée du produit"
            value={form.watch('description') ?? ''}
            onChange={(v: string) =>
              form.setValue('description', v || null, { shouldValidate: true })
            }
            error={form.formState.errors.description?.message as string ?? undefined}
          />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-black/65">Options</label>
            <div className="grid sm:grid-cols-2 gap-4 rounded-md border border-line bg-surface-alt/30 p-4">
              <CheckboxField
                label="Devis uniquement"
                name="quote_only"
                checked={form.watch('quote_only')}
                onChange={(v: boolean) =>
                  form.setValue('quote_only', v, { shouldValidate: true })
                }
              />
              <CheckboxField
                label="En vedette"
                name="featured"
                checked={form.watch('featured')}
                onChange={(v: boolean) =>
                  form.setValue('featured', v, { shouldValidate: true })
                }
              />
              <CheckboxField
                label="Disponible"
                name="available"
                checked={form.watch('available')}
                onChange={(v: boolean) =>
                  form.setValue('available', v, { shouldValidate: true })
                }
              />
              <CheckboxField
                label="Publié"
                name="published"
                checked={form.watch('published')}
                onChange={(v: boolean) =>
                  form.setValue('published', v, { shouldValidate: true })
                }
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="product-thumbnail-input"
              className="mb-1.5 block text-sm text-black/65"
            >
              Vignette
            </label>
            <div
              className="h-40 w-full rounded-md border-2 border-dashed border-line flex items-center justify-center text-sm text-black/50 overflow-hidden relative bg-surface-alt/20"
              onClick={() => fileInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Aperçu"
                    className="h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearThumbnail();
                    }}
                    className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                  >
                    Retirer
                  </button>
                </>
              ) : (
                <div className="text-center pointer-events-none">
                  <p className="font-medium">Cliquez pour ajouter une image</p>
                  <p className="mt-1 text-xs">PNG, JPG, WebP (max 10 Mo)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="product-thumbnail-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>

          <div className="sm:col-span-2 mt-6 pt-5 border-t border-line">
            <h3 className="text-lg font-semibold text-black/90 mb-4">
              Référencement SEO
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Méta-titre"
                name="meta_title"
                placeholder="Titre SEO"
                value={form.watch('meta_title') ?? ''}
                onChange={(v: string) =>
                  form.setValue('meta_title', v || null, { shouldValidate: true })
                }
                error={form.formState.errors.meta_title?.message as string ?? undefined}
              />
              <TextAreaField
                label="Méta-description"
                name="meta_description"
                rows={3}
                className="sm:col-span-2"
                placeholder="Description pour les moteurs de recherche"
                value={form.watch('meta_description') ?? ''}
                onChange={(v: string) =>
                  form.setValue('meta_description', v || null, {
                    shouldValidate: true,
                  })
                }
                error={form.formState.errors.meta_description?.message as string ?? undefined}
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </div>
      </form>
    </AdminCard>
  );
}
