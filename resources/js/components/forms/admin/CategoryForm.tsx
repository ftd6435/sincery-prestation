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

export interface CategoryOption {
  id: number | string;
  name: string;
}

export interface CategoryFormValues {
  id?: number | string;
  name: string;
  description: string | null;
  sort_order: number | null;
  parent_id: number | null;
  is_active: boolean;
  image: File | null;
  image_preview?: string | null;
}

export type PartialCategoryFormValues = Partial<CategoryFormValues>;

const categorySchema = z.object({
  name: z
    .string({ required_error: 'Le nom est requis' })
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne peut contenir au maximum 255 caractères'),
  description: z
    .string()
    .max(255, 'La description ne peut contenir au maximum 255 caractères')
    .nullable()
    .optional(),
  sort_order: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z
      .number({ invalid_type_error: 'Le numéro de tri doit être un entier' })
      .int()
      .min(1, 'Le numéro de tri doit être supérieur ou égal à 1')
      .nullable(),
  ),
  parent_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().nullable(),
  ),
  is_active: z.boolean(),
  image: z.instanceof(File).nullable().optional(),
});

const defaultValues: CategoryFormValues = {
  name: '',
  description: null,
  sort_order: null,
  parent_id: null,
  is_active: true,
  image: null,
  image_preview: null,
};

export interface CategoryFormProps {
  initialValues?: PartialCategoryFormValues;
  categories: CategoryOption[];
  onSubmit: (values: CategoryFormValues) => void;
  submitting?: boolean;
}

export function CategoryForm({
  initialValues,
  categories,
  onSubmit,
  submitting = false,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as never,
    defaultValues,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues?.image_preview ?? null,
  );

  useEffect(() => {
    const merged: CategoryFormValues = {
      ...defaultValues,
      ...initialValues,
    };
    form.reset(merged);
    setImagePreview(initialValues?.image_preview ?? null);
  }, [initialValues, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(initialValues?.image_preview ?? null);
    }
    form.setValue('image', file, { shouldValidate: true });
  };

  const clearImage = () => {
    form.setValue('image', null, { shouldValidate: true });
    setImagePreview(initialValues?.image_preview ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as CategoryFormValues);
  });

  const parentOptions = categories
    .filter((c) => !initialValues?.id || String(c.id) !== String(initialValues.id))
    .map((c) => ({
      value: c.id,
      label: c.name,
    }));

  return (
    <AdminCard className="p-5">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nom"
            name="name"
            required
            className="sm:col-span-2"
            placeholder="Nom de la catégorie"
            value={form.watch('name')}
            onChange={(v: string) => form.setValue('name', v, { shouldValidate: true })}
            error={form.formState.errors.name?.message as string ?? undefined}
          />

          <TextAreaField
            label="Description"
            name="description"
            rows={3}
            className="sm:col-span-2"
            maxLength={255}
            placeholder="Description de la catégorie (max. 255 caractères)"
            value={form.watch('description') ?? ''}
            onChange={(v: string) =>
              form.setValue('description', v || null, { shouldValidate: true })
            }
            error={form.formState.errors.description?.message as string ?? undefined}
          />

          <TextField
            label="Sort order"
            name="sort_order"
            type="number"
            min={1}
            placeholder="1"
            value={form.watch('sort_order') ?? ''}
            onChange={(v: string) =>
              form.setValue(
                'sort_order',
                v === '' || v === null ? null : Number(v),
                { shouldValidate: true },
              )
            }
            error={form.formState.errors.sort_order?.message as string ?? undefined}
          />

          <SelectField
            label="Catégorie parente"
            name="parent_id"
            emptyLabel="Aucune (catégorie racine)"
            options={parentOptions}
            value={form.watch('parent_id') === null ? '' : form.watch('parent_id') ?? ''}
            onChange={(v: string) =>
              form.setValue('parent_id', v === '' ? null : Number(v), {
                shouldValidate: true,
              })
            }
            error={form.formState.errors.parent_id?.message as string ?? undefined}
          />

          <div className="sm:col-span-2">
            <CheckboxField
              label="Actif"
              name="is_active"
              checked={form.watch('is_active')}
              onChange={(v: boolean) =>
                form.setValue('is_active', v, { shouldValidate: true })
              }
              error={form.formState.errors.is_active?.message as string ?? undefined}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="category-image-input"
              className="mb-1.5 block text-sm text-black/65"
            >
              Image
            </label>
            <div
              className="h-40 w-full rounded-md border-2 border-dashed border-line flex items-center justify-center text-sm text-black/50 overflow-hidden relative bg-surface-alt/20"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
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
              id="category-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
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
