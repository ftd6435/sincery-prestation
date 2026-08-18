import { useEffect, useState } from 'react';
import type { TabItem } from '../../components/admin/ui/Tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AtSignIcon,
  KeyRoundIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  SaveIcon,
  ShieldCheckIcon,
  UserIcon,
} from 'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/forms/Field';
import { Tabs } from '../../components/admin/ui/Tabs';
import { SkeletonCard, Skeleton } from '../../components/admin/ui/Skeleton';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useSeo } from '../../utils/seo';
import { toast } from 'sonner';

type ProfileTab = 'info' | 'securite';

const profileSchema = z.object({
  name: z
    .string({ required_error: 'Le nom est requis' })
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  telephone: z
    .string({ required_error: 'Le téléphone est requis' })
    .min(9, 'Le numéro de téléphone doit contenir au moins 9 caractères'),
  email: z
    .string()
    .nullable()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: 'Email invalide',
    }),
  username: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z
      .string({ required_error: 'Le mot de passe actuel est requis' })
      .min(6, 'Le mot de passe actuel doit contenir au moins 6 caractères'),
    new_password: z
      .string({ required_error: 'Le nouveau mot de passe est requis' })
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    new_password_confirmation: z
      .string({ required_error: 'Veuillez confirmer le nouveau mot de passe' })
      .min(8, 'La confirmation doit contenir au moins 8 caractères'),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Les nouveaux mots de passe ne correspondent pas',
    path: ['new_password_confirmation'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AdminProfile() {
  useSeo(
    'Mon profil | Administration Sincery Prestations',
    'Gérez vos informations personnelles et la sécurité de votre compte administrateur.'
  );

  const auth = useAdminAuth();
  const user = auth.user;

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as never,
    defaultValues: {
      name: user?.name ?? '',
      telephone: user?.telephone ?? '',
      email: user?.email ?? null,
      username: user?.username ?? null,
    },
  });

  useEffect(() => {
    if (!user) return;
    resetProfile({
      name: user.name,
      telephone: user.telephone,
      email: user.email,
      username: user.username,
    });
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const [activeTab, setActiveTab] = useState<ProfileTab>('info');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (hash === 'securite') setActiveTab('securite');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeTab === 'securite' && window.location.hash !== '#securite') {
      window.history.replaceState(null, '', '#securite');
    } else if (activeTab === 'info' && window.location.hash !== '') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (activeTab === 'securite') {
      const el = document.getElementById('securite');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  const tabs: TabItem<ProfileTab>[] = [
    {
      value: 'info',
      label: (
        <span className="inline-flex items-center gap-2">
          <UserIcon className="h-4 w-4" aria-hidden />
          Informations personnelles
        </span>
      ),
    },
    {
      value: 'securite',
      label: (
        <span className="inline-flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4" aria-hidden />
          Sécurité
        </span>
      ),
    },
  ];

  async function onSubmitProfile(values: ProfileFormValues) {
    try {
      await auth.updateProfile({
        name: values.name,
        telephone: values.telephone,
        email: values.email,
        username: values.username,
      });
      toast.success('Profil mis à jour', {
        description: 'Vos informations personnelles ont été enregistrées.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      toast.error('Impossible de mettre à jour le profil', { description: msg });
    }
  }

  async function onSubmitPassword(values: PasswordFormValues) {
    try {
      await auth.updatePassword(
        values.current_password,
        values.new_password,
        values.new_password_confirmation
      );
      toast.success('Mot de passe modifié', {
        description: 'Votre mot de passe a été mis à jour avec succès.',
      });
      resetPassword({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      toast.error('Impossible de modifier le mot de passe', { description: msg });
    }
  }

  if (auth.loading || !user) {
    return (
      <>
        <AdminPageHeader
          title="Mon profil"
          description="Gestion de vos informations et de la sécurité de votre compte."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:items-start">
          <SkeletonCard>
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </SkeletonCard>
          <div className="space-y-4">
            <SkeletonCard>
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </SkeletonCard>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Mon profil"
        description={`Connecté en tant que ${user.name}${user.role ? ` · ${user.role}` : ''}`}
      />

      <div className="mb-4">
        <Tabs<ProfileTab> value={activeTab} onChange={setActiveTab} tabs={tabs} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
        <AdminCard className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white shadow-glow">
              {getInitials(user.name)}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-black/90">{user.name}</h2>
            <p className="mt-1 text-sm text-brand">{user.role ?? 'Administrateur'}</p>
            <div className="mt-4 w-full space-y-2 border-t border-line pt-4 text-left text-sm">
              {user.email && (
                <div className="flex items-center gap-2 text-black/65">
                  <MailIcon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-black/65">
                <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{user.telephone}</span>
              </div>
              {user.username && (
                <div className="flex items-center gap-2 text-black/65">
                  <AtSignIcon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">@{user.username}</span>
                </div>
              )}
              {user.created_at && (
                <div className="flex items-center gap-2 text-black/45 pt-1 text-xs">
                  <UserIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    Inscrit depuis{' '}
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </AdminCard>

        <div className="space-y-4">
          <AdminCard className="p-5" id="informations">
            <div className="mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-brand" aria-hidden />
              <h3 className="text-lg font-semibold text-black/90">
                Informations personnelles
              </h3>
            </div>
            <form onSubmit={handleSubmitProfile(onSubmitProfile as Parameters<typeof handleSubmitProfile>[0])} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="Nom complet"
                  required
                  icon={<UserIcon className="h-4 w-4" aria-hidden />}
                  error={profileErrors.name?.message ?? null}
                  placeholder="Ex : Mamadou Diallo"
                  {...registerProfile('name')}
                />
              </div>
              <div>
                <TextField
                  label="Téléphone"
                  required
                  icon={<PhoneIcon className="h-4 w-4" aria-hidden />}
                  error={profileErrors.telephone?.message ?? null}
                  placeholder="Ex : +224 620 00 00 00"
                  {...registerProfile('telephone')}
                />
              </div>
              <div>
                <TextField
                  label="Email"
                  type="email"
                  icon={<MailIcon className="h-4 w-4" aria-hidden />}
                  error={profileErrors.email?.message ?? null}
                  placeholder="Ex : vous@entreprise.com"
                  {...registerProfile('email')}
                />
              </div>
              <div className="sm:col-span-2">
                <TextField
                  label="Nom d'utilisateur"
                  icon={<AtSignIcon className="h-4 w-4" aria-hidden />}
                  error={profileErrors.username?.message ?? null}
                  placeholder="Identifiant de connexion (optionnel)"
                  {...registerProfile('username')}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  loading={profileSubmitting}
                  disabled={profileSubmitting}
                  iconLeft={<SaveIcon className="h-4 w-4" aria-hidden />}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </AdminCard>

          <AdminCard className="p-5" id="securite">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-brand" aria-hidden />
              <h3 className="text-lg font-semibold text-black/90">Sécurité</h3>
            </div>
            <p className="mb-4 text-sm text-black/60">
              Modifiez régulièrement votre mot de passe pour assurer la sécurité de votre compte.
              Utilisez un mot de passe unique d’au moins 8 caractères.
            </p>
            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <TextField
                  label="Mot de passe actuel"
                  type="password"
                  required
                  icon={<LockIcon className="h-4 w-4" aria-hidden />}
                  error={passwordErrors.current_password?.message ?? null}
                  placeholder="Votre mot de passe actuel"
                  {...registerPassword('current_password')}
                />
              </div>
              <div>
                <TextField
                  label="Nouveau mot de passe"
                  type="password"
                  required
                  icon={<KeyRoundIcon className="h-4 w-4" aria-hidden />}
                  error={passwordErrors.new_password?.message ?? null}
                  placeholder="8 caractères minimum"
                  {...registerPassword('new_password')}
                />
              </div>
              <div>
                <TextField
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  required
                  icon={<KeyRoundIcon className="h-4 w-4" aria-hidden />}
                  error={passwordErrors.new_password_confirmation?.message ?? null}
                  placeholder="Répétez le nouveau mot de passe"
                  {...registerPassword('new_password_confirmation')}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  variant="warning"
                  loading={passwordSubmitting}
                  disabled={passwordSubmitting}
                  iconLeft={<ShieldCheckIcon className="h-4 w-4" aria-hidden />}
                >
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
