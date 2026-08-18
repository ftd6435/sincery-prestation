import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';
import {
  CheckboxField,
  SelectField,
  TextField,
} from '../Field';
import { UserIcon, UploadIcon } from 'lucide-react';

const baseSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  telephone: z
    .string()
    .min(9, 'Le téléphone doit contenir au moins 9 caractères')
    .max(14, 'Le téléphone ne peut pas dépasser 14 caractères'),
  email: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Adresse email invalide',
    ),
  role: z.enum(['user', 'client', 'admin', 'super_admin'], {
    required_error: 'Le rôle est requis',
  }),
  avatar: z.any().optional(),
  is_active: z.boolean().default(true),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  password_confirmation: z.string(),
});

const editSchema = baseSchema
  .omit({ password: true, password_confirmation: true })
  .extend({
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.password_confirmation;
      }
      return true;
    },
    {
      message: 'Les mots de passe ne correspondent pas',
      path: ['password_confirmation'],
    },
  );

const createSchema = baseSchema.refine(
  (data) => data.password === data.password_confirmation,
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  },
);

export type UserFormValues = z.infer<typeof baseSchema>;

export interface UserFormProps {
  initialValues?: Partial<UserFormValues>;
  onSubmit: (values: UserFormValues) => void;
  submitting?: boolean;
  isEdit?: boolean;
}

const roleOptions = [
  { value: 'user', label: 'Utilisateur' },
  { value: 'client', label: 'Client' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super administrateur' },
];

export function UserForm({
  initialValues,
  onSubmit,
  submitting = false,
  isEdit = false,
}: UserFormProps) {
  const schema = isEdit ? editSchema : createSchema;

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      telephone: '',
      email: '',
      role: 'user',
      is_active: true,
      password: '',
      password_confirmation: '',
      ...initialValues,
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (initialValues?.avatar as string) || null,
  );

  useEffect(() => {
    reset({
      name: '',
      telephone: '',
      email: '',
      role: 'user',
      is_active: true,
      password: '',
      password_confirmation: '',
      ...initialValues,
    });
    if (initialValues?.avatar) {
      setAvatarPreview(initialValues.avatar as string);
    }
  }, [initialValues, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('avatar', file as any, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AdminCard className="p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-surface-alt">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-10 w-10 text-black/35" aria-hidden="true" />
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-brand hover:bg-[rgba(193,39,45,0.06)]">
                <UploadIcon className="h-4 w-4" aria-hidden="true" />
                Téléverser
              </span>
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nom"
            name="name"
            required
            placeholder="Nom complet"
            value={watch('name')}
            onChange={(v: string) => setValue('name', v, { shouldValidate: true })}
            error={errors.name?.message as string ?? undefined}
          />

          <TextField
            label="Téléphone"
            name="telephone"
            type="tel"
            required
            placeholder="+224 6XX XX XX XX"
            value={watch('telephone')}
            onChange={(v: string) => setValue('telephone', v, { shouldValidate: true })}
            error={errors.telephone?.message as string ?? undefined}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            placeholder="utilisateur@exemple.com"
            value={watch('email') ?? ''}
            onChange={(v: string) => setValue('email', v || null as any, { shouldValidate: true })}
            error={errors.email?.message as string ?? undefined}
          />

          <SelectField
            label="Rôle"
            name="role"
            required
            value={watch('role')}
            onChange={(v: string) => setValue('role', v as any, { shouldValidate: true })}
            error={errors.role?.message as string ?? undefined}
            options={roleOptions}
          />
        </div>

        <CheckboxField
          label="Actif"
          name="is_active"
          checked={watch('is_active')}
          onChange={(v: boolean) => setValue('is_active', v, { shouldValidate: true })}
          error={errors.is_active?.message as string ?? undefined}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={isEdit ? 'Mot de passe (laisser vide pour conserver)' : 'Mot de passe'}
            name="password"
            type="password"
            required={!isEdit}
            placeholder="••••••••"
            value={watch('password') ?? ''}
            onChange={(v: string) => setValue('password', v, { shouldValidate: true })}
            error={errors.password?.message as string ?? undefined}
          />

          <TextField
            label="Confirmation du mot de passe"
            name="password_confirmation"
            type="password"
            required={!isEdit}
            placeholder="••••••••"
            value={watch('password_confirmation') ?? ''}
            onChange={(v: string) => setValue('password_confirmation', v, { shouldValidate: true })}
            error={errors.password_confirmation?.message as string ?? undefined}
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          >
            Enregistrer l&apos;utilisateur
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
