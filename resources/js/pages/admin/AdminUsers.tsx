import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BanIcon,
  CheckCircle2Icon,
  MoreVerticalIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldIcon,
  Trash2Icon,
  UserPlusIcon,
  XCircleIcon,
} from 'lucide-react';
import { api, firstErrorByField } from '../../lib/api';
import { useSeo } from '../../utils/seo';
import { formatShortDate } from '../../utils/format';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, type DataTableColumn } from '../../components/admin/ui/DataTable';
import { Drawer } from '../../components/admin/ui/Drawer';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { StatusBadge, type Tone } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  SelectField,
  TextField,
} from '../../components/forms/Field';
import type { ApiUser } from '../../types/admin';

type UserRole = 'super_admin' | 'admin' | 'editor';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  editor: 'Éditeur',
};

const roleTones: Record<UserRole, Tone> = {
  super_admin: 'danger',
  admin: 'info',
  editor: 'warning',
};

const roleDescriptions: Record<UserRole, string> = {
  super_admin: 'Accès complet, y compris la gestion des utilisateurs, des rôles et des paramètres système.',
  admin: 'Gestion des produits, commandes, devis, actualités, messages et partenaires.',
  editor: 'Gestion des actualités et du contenu éditorial du site uniquement.',
};

const registerSchema = z.object({
  name: z.string().min(2, 'Nom requis (2 caractères minimum)'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(5, 'Téléphone requis'),
  username: z.string().min(2, 'Identifiant requis (2 caractères minimum)').optional().or(z.literal('')),
  role: z.enum(['super_admin', 'admin', 'editor'], {
    required_error: 'Le rôle est requis',
  }),
  password: z.string().min(6, 'Mot de passe requis (6 caractères minimum)'),
});

type RegisterValues = z.infer<typeof registerSchema>;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AdminUsers() {
  useSeo(
    'Utilisateurs | Administration Sincery Prestations',
    'Gestion des comptes administrateurs et attribution des rôles.'
  );

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [switchingId, setSwitchingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      telephone: '',
      username: '',
      role: 'editor',
      password: '',
    },
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ApiUser[]>('/v1/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (openMenuId === null) return;
    function onDocClick() {
      setOpenMenuId(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenuId(null);
    }
    window.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [openMenuId]);

  function openRegister() {
    reset({
      name: '',
      email: '',
      telephone: '',
      username: '',
      role: 'editor',
      password: '',
    });
    setDrawerOpen(true);
  }

  async function handleRegister(values: RegisterValues) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        username: values.username || undefined,
      };
      const created = await api.post<ApiUser>('/v1/admin/register', payload);
      toast.success('Utilisateur créé', {
        description: `${created.name} a été ajouté avec succès.`,
      });
      setDrawerOpen(false);
      await fetchUsers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      const errShape = e instanceof Error && 'errors' in (e as unknown as object)
        ? (e as unknown as { errors?: Record<string, string[] | undefined> }).errors
        : undefined;
      toast.error('Création échouée', { description: msg });
      if (errShape) {
        (Object.keys(errShape) as Array<keyof RegisterValues>).forEach((field) => {
          const err = firstErrorByField(errShape, field as string);
          if (err) setErrorField(field, err);
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function setErrorField(field: keyof RegisterValues, _message: string) {
    setValue(field, watch(field) as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setTimeout(() => {
      /* zod resolver handles, but force a re-render with custom errors via trigger */
    }, 0);
  }

  async function handleSwitchStatus(user: ApiUser) {
    setSwitchingId(user.id as number);
    try {
      await api.patch(`/v1/admin/switch-status/${user.id}`);
      const nextState = user.is_active ? 'bloqué' : 'activé';
      toast.success(`Compte ${nextState}`, {
        description: `${user.name} est maintenant ${nextState}.`,
      });
      await fetchUsers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Action échouée', { description: msg });
    } finally {
      setSwitchingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      toast.info('Suppression non disponible via API standard', {
        description: 'Utilisez le bouton basculer le statut pour bloquer/débloquer.',
      });
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  const counts = useMemo(() => {
    let active = 0;
    let blocked = 0;
    users.forEach((u) => {
      if (u.is_active) active += 1;
      else blocked += 1;
    });
    return { active, blocked };
  }, [users]);

  const columns: DataTableColumn<ApiUser>[] = [
    {
      key: 'user',
      header: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
            style={{
              backgroundColor:
                row.role === 'super_admin'
                  ? '#B91C1C'
                  : row.role === 'admin'
                    ? '#1D4ED8'
                    : '#B45309',
            }}
            aria-hidden
          >
            {getInitials(row.name)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-black/90 truncate">{row.name}</div>
            <div className="text-sm text-black/50 truncate">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'telephone',
      header: 'Téléphone',
      hideBelow: 'sm',
      render: (row) => (
        <span className="text-black/70 tabular-nums">{row.telephone ?? '—'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      render: (row) => {
        const r = (row.role ?? 'editor') as UserRole;
        return (
          <StatusBadge tone={roleTones[r] ?? 'neutral'}>
            <ShieldIcon className="h-3.5 w-3.5" aria-hidden />
            {roleLabels[r] ?? row.role}
          </StatusBadge>
        );
      },
    },
    {
      key: 'status',
      header: 'Statut',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!row.is_active}
              disabled={switchingId === row.id}
              onChange={() => void handleSwitchStatus(row)}
              aria-label={`Basculer statut de ${row.name}`}
            />
            <div className="peer h-6 w-11 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-full peer-disabled:opacity-60" />
            <span className="sr-only">Basculer statut</span>
          </label>
          <StatusBadge tone={row.is_active ? 'success' : 'neutral'}>
            {row.is_active ? (
              <><CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden /> Actif</>
            ) : (
              <><BanIcon className="h-3.5 w-3.5" aria-hidden /> Bloqué</>
            )}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Inscrit le',
      hideBelow: 'md',
      render: (row) => (
        <span className="text-black/65 tabular-nums">
          {row.created_at ? formatShortDate(row.created_at) : '—'}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <AdminPageHeader
        title="Utilisateurs"
        description={`${users.length} comptes enregistrés · ${counts.active} actifs · ${counts.blocked} bloqués.`}
        actions={
          <Button
            size="sm"
            iconLeft={<PlusIcon className="h-4 w-4" aria-hidden />}
            onClick={openRegister}
          >
            Ajouter un utilisateur
          </Button>
        }
      />

      {error && (
        <AdminCard className="mb-4 border-danger/40 bg-danger-bg/50">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
              <div>
                <p className="font-semibold text-danger">Erreur de chargement</p>
                <p className="text-sm text-black/65">{error}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RefreshCwIcon className="h-4 w-4" aria-hidden />}
              onClick={() => void fetchUsers()}
            >
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <DataTable
          columns={columns}
          rows={users}
          loading={loading}
          emptyTitle="Aucun utilisateur"
          emptyHint="Ajoutez votre premier utilisateur avec le bouton « Ajouter un utilisateur »."
          rowActions={(row) => (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Actions pour ${row.name}`}
                aria-haspopup="menu"
                aria-expanded={openMenuId === row.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === row.id ? null : (row.id as number));
                }}
              >
                <MoreVerticalIcon className="h-4 w-4" aria-hidden />
              </Button>
              {openMenuId === row.id && (
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-1 w-52 divide-y divide-line rounded-md border border-line bg-white p-1 shadow-elevated"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-alt"
                    onClick={() => {
                      setOpenMenuId(null);
                      void handleSwitchStatus(row);
                    }}
                    disabled={switchingId === row.id}
                  >
                    {row.is_active ? (
                      <><BanIcon className="h-4 w-4 text-warning" aria-hidden /> Bloquer</>
                    ) : (
                      <><CheckCircle2Icon className="h-4 w-4 text-success" aria-hidden /> Activer</>
                    )}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                    onClick={() => {
                      setOpenMenuId(null);
                      setDeleteTarget(row);
                    }}
                  >
                    <Trash2Icon className="h-4 w-4" aria-hidden />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        />

        <AdminCard className="p-4 sticky top-4">
          <h2 className="text-lg font-semibold text-black/90">
            Rôles et permissions
          </h2>
          <dl className="mt-3 space-y-4">
            {(Object.keys(roleLabels) as UserRole[]).map((role) => (
              <div key={role} className="rounded-md border border-line p-3">
                <dt className="flex items-center gap-2">
                  <StatusBadge tone={roleTones[role]}>
                    <ShieldIcon className="h-3.5 w-3.5" aria-hidden />
                    {roleLabels[role]}
                  </StatusBadge>
                </dt>
                <dd className="mt-2 text-sm text-black/65 leading-relaxed">
                  {roleDescriptions[role]}
                </dd>
              </div>
            ))}
          </dl>
        </AdminCard>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => !submitting && setDrawerOpen(false)}
        size="md"
        title="Créer un utilisateur"
        description="Attribuez un rôle pour définir les permissions d’accès."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !submitting && setDrawerOpen(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={submitting}
              onClick={handleSubmit(handleRegister) as never}
              iconLeft={<UserPlusIcon className="h-4 w-4" aria-hidden />}
            >
              Créer l’utilisateur
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4" noValidate>
          <TextField
            label="Nom complet"
            name="name"
            required
            value={watch('name')}
            onChange={(v: string) =>
              setValue('name', v, { shouldValidate: true })
            }
            error={errors.name?.message as string | undefined}
            placeholder="Prénom et Nom"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              value={watch('email')}
              onChange={(v: string) =>
                setValue('email', v, { shouldValidate: true })
              }
              error={errors.email?.message as string | undefined}
              placeholder="utilisateur@exemple.com"
            />

            <TextField
              label="Téléphone"
              name="telephone"
              required
              value={watch('telephone')}
              onChange={(v: string) =>
                setValue('telephone', v, { shouldValidate: true })
              }
              error={errors.telephone?.message as string | undefined}
              placeholder="+224 …"
            />
          </div>

          <TextField
            label="Identifiant (optionnel)"
            name="username"
            value={watch('username') ?? ''}
            onChange={(v: string) =>
              setValue('username', v, { shouldValidate: true })
            }
            error={errors.username?.message as string | undefined}
            placeholder="Identifiant de connexion"
          />

          <SelectField
            label="Rôle"
            name="role"
            required
            value={watch('role')}
            onChange={(v: string) =>
              setValue('role', v as UserRole, { shouldValidate: true })
            }
            error={errors.role?.message as string | undefined}
            emptyLabel={null}
            options={(Object.keys(roleLabels) as UserRole[]).map((r) => ({
              value: r,
              label: roleLabels[r],
            }))}
          />

          <TextField
            label="Mot de passe"
            name="password"
            type="password"
            required
            value={watch('password')}
            onChange={(v: string) =>
              setValue('password', v, { shouldValidate: true })
            }
            error={errors.password?.message as string | undefined}
            placeholder="6 caractères minimum"
            helpText="L’utilisateur pourra modifier son mot de passe depuis son profil."
          />

          <button type="submit" className="hidden" aria-hidden tabIndex={-1}>
            Envoyer
          </button>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !submitting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        tone="warning"
        loading={submitting}
        dismissible={!submitting}
        title={deleteTarget ? `Gérer le compte ${deleteTarget.name} ?` : ''}
        description="Pour des raisons de sécurité, la suppression de comptes administrateurs est gérée par le basculement de statut (bloqué/actif)."
        confirmLabel="Basculer le statut"
      >
        {deleteTarget && (
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-black/50">Email:</span>{' '}
              <span className="text-black/70">{deleteTarget.email}</span>
            </div>
            <div>
              <span className="text-black/50">Rôle:</span>{' '}
              <span className="font-medium text-black/85">
                {roleLabels[(deleteTarget.role ?? 'editor') as UserRole] ?? deleteTarget.role}
              </span>
            </div>
            <div>
              <span className="text-black/50">Statut actuel:</span>{' '}
              <span className={deleteTarget.is_active ? 'text-success font-medium' : 'text-warning font-medium'}>
                {deleteTarget.is_active ? 'Actif' : 'Bloqué'}
              </span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </motion.div>
  );
}
