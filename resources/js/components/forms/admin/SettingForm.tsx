import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2Icon, UploadIcon } from 'lucide-react';
import { TextField, TextAreaField, SelectField, CheckboxField } from '../../forms/Field';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';

export type SettingType = 'text' | 'boolean' | 'integer' | 'decimal' | 'json' | 'image';

export interface SettingFormValues {
  key: string;
  type: SettingType;
  value: string | number | boolean | null;
  value_file?: File | null;
  value_file_preview?: string | null;
}

const settingSchema = z.object({
  key: z.string().min(1, 'Ce champ est obligatoire.').max(255, 'La clé doit contenir au maximum 255 caractères.'),
  type: z.enum(['text', 'boolean', 'json', 'image', 'integer', 'decimal'], {
    errorMap: () => ({ message: 'Ce champ est obligatoire.' }),
  }),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
});

const defaultValues: SettingFormValues = {
  key: '',
  type: 'text',
  value: null,
  value_file: null,
  value_file_preview: null,
};

interface SettingFormProps {
  initialValues?: Partial<SettingFormValues>;
  onSubmit: (values: SettingFormValues) => void;
  submitting?: boolean;
}

const typeOptions: { value: SettingType; label: string }[] = [
  { value: 'text', label: 'Texte' },
  { value: 'boolean', label: 'Booléen' },
  { value: 'integer', label: 'Entier' },
  { value: 'decimal', label: 'Décimal' },
  { value: 'json', label: 'JSON' },
  { value: 'image', label: 'Image' },
];

export function SettingForm({ initialValues, onSubmit, submitting = false }: SettingFormProps) {
  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema) as never,
    defaultValues,
  });

  const [filePreview, setFilePreview] = useState<string | null>(initialValues?.value_file_preview ?? null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const selectedType = form.watch('type') ?? 'text';

  useEffect(() => {
    const merged: SettingFormValues = {
      ...defaultValues,
      ...initialValues,
    };
    form.reset(merged);
    setFilePreview(initialValues?.value_file_preview ?? null);
    setJsonError(null);
  }, [initialValues, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        e.target.value = '';
        form.setValue('value_file', null, { shouldValidate: true });
        setFilePreview(initialValues?.value_file_preview ?? null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(initialValues?.value_file_preview ?? null);
    }
    form.setValue('value_file', file, { shouldValidate: true });
  };

  const handleJsonChange = (v: string) => {
    form.setValue('value', v || null, { shouldValidate: true });
    if (v.trim()) {
      try {
        JSON.parse(v);
        setJsonError(null);
      } catch {
        setJsonError('JSON invalide. Vérifiez la syntaxe.');
      }
    } else {
      setJsonError(null);
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (selectedType === 'json' && typeof values.value === 'string' && values.value.trim()) {
      try {
        JSON.parse(values.value);
      } catch {
        setJsonError('JSON invalide. Vérifiez la syntaxe.');
        return;
      }
    }
    onSubmit(values);
  });

  const renderValueField = () => {
    switch (selectedType) {
      case 'boolean':
        return (
          <CheckboxField
            label="Valeur (booléen)"
            name="value_boolean"
            checked={Boolean(form.watch('value'))}
            onChange={(v: boolean) => form.setValue('value', v, { shouldValidate: true })}
          />
        );

      case 'integer':
        return (
          <TextField
            label="Valeur"
            name="value_integer"
            type="number"
            step={1}
            value={String(form.watch('value') ?? '') as string | number}
            onChange={(v: string) => form.setValue('value', v === '' ? null : Number(v), { shouldValidate: true })}
            error={form.formState.errors.value?.message as string ?? undefined}
          />
        );

      case 'decimal':
        return (
          <TextField
            label="Valeur"
            name="value_decimal"
            type="number"
            step="0.01"
            suffix="GNF"
            value={String(form.watch('value') ?? '') as string | number}
            onChange={(v: string) => form.setValue('value', v === '' ? null : Number(v), { shouldValidate: true })}
            error={form.formState.errors.value?.message as string ?? undefined}
          />
        );

      case 'image':
        return (
          <div>
            <label className="mb-1.5 block text-sm text-black/65">
              Valeur
            </label>
            <div className="flex flex-wrap items-start gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-black/75 hover:bg-surface-alt">
                <UploadIcon className="h-4 w-4" aria-hidden="true" />
                <span>Choisir un fichier</span>
                <input
                  type="file"
                  accept="image/*,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {filePreview && (
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-alt">
                  <img
                    src={filePreview}
                    alt="Aperçu de l'image"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-black/55">PNG/JPG/SVG/WebP max 5Mo</p>
          </div>
        );

      case 'json':
        return (
          <TextAreaField
            label="Valeur"
            name="value_json"
            rows={6}
            className="sm:col-span-2 font-mono"
            value={String(form.watch('value') ?? '') as string}
            onChange={handleJsonChange}
            error={jsonError ?? (form.formState.errors.value?.message as string ?? undefined)}
            placeholder='{"cle": "valeur", "tableau": [1, 2, 3]}'
            helpText="Doit être un JSON valide."
          />
        );

      case 'text':
      default:
        return (
          <TextAreaField
            label="Valeur"
            name="value_text"
            rows={3}
            className="sm:col-span-2"
            value={String(form.watch('value') ?? '') as string}
            onChange={(v: string) => form.setValue('value', v || null, { shouldValidate: true })}
            error={form.formState.errors.value?.message as string ?? undefined}
          />
        );
    }
  };

  return (
    <AdminCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Clé"
            name="key"
            required
            maxLength={255}
            value={form.watch('key')}
            onChange={(v: string) => form.setValue('key', v, { shouldValidate: true })}
            error={form.formState.errors.key?.message as string ?? undefined}
          />

          <SelectField
            label="Type"
            name="type"
            required
            value={form.watch('type')}
            onChange={(v: string) => {
              form.setValue('type', v as SettingType, { shouldValidate: true });
              form.setValue('value', null, { shouldValidate: true });
              form.setValue('value_file', null, { shouldValidate: true });
              setFilePreview(null);
              setJsonError(null);
            }}
            error={form.formState.errors.type?.message as string ?? undefined}
            options={typeOptions}
          />

          <div className="sm:col-span-2">
            {renderValueField()}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting || !!jsonError}
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
