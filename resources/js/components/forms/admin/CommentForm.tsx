import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '../Field';

export interface CommentPostOption {
  id: number;
  title: string;
}

export interface CommentFormValues {
  post_id: number | null;
  name: string;
  email: string | null;
  content: string;
  is_approved: boolean;
  parent_id: number | null;
}

export interface CommentFormProps {
  initialValues?: Partial<CommentFormValues>;
  posts: CommentPostOption[];
  onSubmit: (values: CommentFormValues) => void;
  submitting?: boolean;
}

const schema = z.object({
  post_id: z.coerce.number({
    required_error: 'L\'article est requis',
    invalid_type_error: 'L\'article est requis',
  }).int().positive('L\'article est requis'),
  name: z.string().min(1, 'Le nom de l\'auteur est requis'),
  email: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Adresse email invalide',
    ),
  content: z.string().min(1, 'Le contenu est requis'),
  is_approved: z.boolean().default(false),
  parent_id: z.coerce.number().int().nullable().optional(),
});

export function CommentForm({
  initialValues,
  posts,
  onSubmit,
  submitting = false,
}: CommentFormProps) {
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      post_id: null,
      name: '',
      email: '',
      content: '',
      is_approved: false,
      parent_id: null,
      ...initialValues,
    },
  });

  useEffect(() => {
    reset({
      post_id: null,
      name: '',
      email: '',
      content: '',
      is_approved: false,
      parent_id: null,
      ...initialValues,
    });
  }, [initialValues, reset]);

  const postOptions = posts.map((p) => ({
    value: p.id,
    label: p.title,
  }));

  return (
    <AdminCard className="p-5">
      <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Article"
            name="post_id"
            required
            value={watch('post_id') ?? ''}
            onChange={(v: string) =>
              setValue('post_id', v ? Number(v) : null as any, { shouldValidate: true })
            }
            error={errors.post_id?.message as string ?? undefined}
            options={postOptions}
            emptyLabel="Sélectionner un article"
          />

          <TextField
            label="Nom auteur"
            name="name"
            required
            placeholder="Nom de l'auteur"
            value={watch('name')}
            onChange={(v: string) => setValue('name', v, { shouldValidate: true })}
            error={errors.name?.message as string ?? undefined}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            placeholder="auteur@exemple.com"
            value={watch('email') ?? ''}
            onChange={(v: string) =>
              setValue('email', v || null as any, { shouldValidate: true })
            }
            error={errors.email?.message as string ?? undefined}
          />

          <SelectField
            label="Commentaire parent"
            name="parent_id"
            value={watch('parent_id') ?? ''}
            onChange={(v: string) =>
              setValue('parent_id', v ? Number(v) : null, { shouldValidate: true })
            }
            error={errors.parent_id?.message as string ?? undefined}
            options={[]}
            emptyLabel="Aucun (commentaire racine)"
          />
        </div>

        <TextAreaField
          label="Contenu"
          name="content"
          required
          rows={5}
          placeholder="Votre commentaire..."
          value={watch('content')}
          onChange={(v: string) => setValue('content', v, { shouldValidate: true })}
          error={errors.content?.message as string ?? undefined}
        />

        <CheckboxField
          label="Approuvé"
          name="is_approved"
          checked={watch('is_approved')}
          onChange={(v: boolean) => setValue('is_approved', v, { shouldValidate: true })}
          error={errors.is_approved?.message as string ?? undefined}
        />

        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          >
            Enregistrer le commentaire
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
