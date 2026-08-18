import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2Icon } from 'lucide-react';
import { TextField, CheckboxField } from '../../forms/Field';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';

export interface PartnerCategoryFormValues {
  name: string;
  is_active: boolean;
}

const partnerCategorySchema = z.object({
  name: z.string().min(1, 'Ce champ est obligatoire.'),
  is_active: z.boolean().default(true),
});

const defaultValues: PartnerCategoryFormValues = {
  name: '',
  is_active: true,
};

interface PartnerCategoryFormProps {
  initialValues?: Partial<PartnerCategoryFormValues>;
  onSubmit: (values: PartnerCategoryFormValues) => void;
  submitting?: boolean;
}

export function PartnerCategoryForm({ initialValues, onSubmit, submitting = false }: PartnerCategoryFormProps) {
  const form = useForm<PartnerCategoryFormValues>({
    resolver: zodResolver(partnerCategorySchema) as never,
    defaultValues,
  });

  useEffect(() => {
    const merged: PartnerCategoryFormValues = {
      ...defaultValues,
      ...initialValues,
    };
    form.reset(merged);
  }, [initialValues, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as PartnerCategoryFormValues);
  });

  return (
    <AdminCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-1">
          <TextField
            label="Nom"
            name="name"
            required
            value={form.watch('name')}
            onChange={(v: string) => form.setValue('name', v, { shouldValidate: true })}
            error={form.formState.errors.name?.message as string ?? undefined}
          />

          <CheckboxField
            label="Actif"
            name="is_active"
            checked={form.watch('is_active')}
            onChange={(v: boolean) => form.setValue('is_active', v, { shouldValidate: true })}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
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
