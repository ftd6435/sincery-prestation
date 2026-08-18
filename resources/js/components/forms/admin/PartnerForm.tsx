import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2Icon, UploadIcon } from 'lucide-react';
import { TextField, TextAreaField, SelectField, CheckboxField } from '../../forms/Field';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';

export interface PartnerCategoryOption {
  id: number;
  name: string;
}

export interface PartnerFormValues {
  sector: string;
  name: string;
  category_id: number | null;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo?: File | null;
  logo_preview?: string | null;
  is_featured: boolean;
  is_active: boolean;
  description: string | null;
}

const partnerSchema = z.object({
  category_id: z.number().int().min(1, 'Ce champ est obligatoire.'),
  sector: z.string().min(1, 'Ce champ est obligatoire.'),
  name: z.string().min(1, 'Ce champ est obligatoire.'),
  email: z.string().email('Adresse email invalide.'),
  phone: z.string().min(9, 'Le téléphone doit contenir au moins 9 caractères.').max(14, 'Le téléphone doit contenir au maximum 14 caractères.'),
  address: z.string().min(1, 'Ce champ est obligatoire.'),
  website: z.string().url('L\'URL du site web est invalide.'),
  description: z.string().nullable().optional(),
  is_featured: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

const defaultValues: PartnerFormValues = {
  sector: '',
  name: '',
  category_id: null,
  email: '',
  phone: '',
  address: '',
  website: '',
  logo: null,
  logo_preview: null,
  is_featured: true,
  is_active: true,
  description: null,
};

interface PartnerFormProps {
  initialValues?: Partial<PartnerFormValues>;
  partnerCategories: PartnerCategoryOption[];
  onSubmit: (values: PartnerFormValues) => void;
  submitting?: boolean;
}

export function PartnerForm({ initialValues, partnerCategories, onSubmit, submitting = false }: PartnerFormProps) {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema) as never,
    defaultValues,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(initialValues?.logo_preview ?? null);

  useEffect(() => {
    const merged: PartnerFormValues = {
      ...defaultValues,
      ...initialValues,
    };
    form.reset(merged);
    setLogoPreview(initialValues?.logo_preview ?? null);
  }, [initialValues, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(initialValues?.logo_preview ?? null);
    }
    form.setValue('logo', file, { shouldValidate: true });
  };

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as PartnerFormValues);
  });

  const categoryOptions = partnerCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <AdminCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Secteur"
            name="sector"
            required
            value={form.watch('sector')}
            onChange={(v: string) => form.setValue('sector', v, { shouldValidate: true })}
            error={form.formState.errors.sector?.message as string ?? undefined}
          />

          <TextField
            label="Nom"
            name="name"
            required
            value={form.watch('name')}
            onChange={(v: string) => form.setValue('name', v, { shouldValidate: true })}
            error={form.formState.errors.name?.message as string ?? undefined}
          />

          <SelectField
            label="Catégorie"
            name="category_id"
            required
            value={form.watch('category_id') ?? ''}
            onChange={(v: string) => form.setValue('category_id', v ? Number(v) : null, { shouldValidate: true })}
            error={form.formState.errors.category_id?.message as string ?? undefined}
            options={categoryOptions}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            required
            value={form.watch('email')}
            onChange={(v: string) => form.setValue('email', v, { shouldValidate: true })}
            error={form.formState.errors.email?.message as string ?? undefined}
          />

          <TextField
            label="Téléphone"
            name="phone"
            type="tel"
            required
            value={form.watch('phone')}
            onChange={(v: string) => form.setValue('phone', v, { shouldValidate: true })}
            error={form.formState.errors.phone?.message as string ?? undefined}
          />

          <TextField
            label="Site web"
            name="website"
            type="url"
            required
            value={form.watch('website')}
            onChange={(v: string) => form.setValue('website', v, { shouldValidate: true })}
            error={form.formState.errors.website?.message as string ?? undefined}
          />

          <TextAreaField
            label="Adresse"
            name="address"
            rows={3}
            required
            className="sm:col-span-2"
            value={form.watch('address')}
            onChange={(v: string) => form.setValue('address', v, { shouldValidate: true })}
            error={form.formState.errors.address?.message as string ?? undefined}
          />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-black/65">
              Logo<span className="text-brand"> *</span>
            </label>
            <div className="flex flex-wrap items-start gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-black/75 hover:bg-surface-alt">
                <UploadIcon className="h-4 w-4" aria-hidden="true" />
                <span>Choisir un fichier</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {logoPreview && (
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-alt">
                  <img
                    src={logoPreview}
                    alt="Aperçu du logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            <CheckboxField
              label="En vedette"
              name="is_featured"
              checked={form.watch('is_featured')}
              onChange={(v: boolean) => form.setValue('is_featured', v, { shouldValidate: true })}
            />
            <CheckboxField
              label="Actif"
              name="is_active"
              checked={form.watch('is_active')}
              onChange={(v: boolean) => form.setValue('is_active', v, { shouldValidate: true })}
            />
          </div>

          <TextAreaField
            label="Description"
            name="description"
            rows={4}
            className="sm:col-span-2"
            value={form.watch('description') ?? ''}
            onChange={(v: string) => form.setValue('description', v || null, { shouldValidate: true })}
            error={form.formState.errors.description?.message as string ?? undefined}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            iconLeft={submitting ? undefined : undefined}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
