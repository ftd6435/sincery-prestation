import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircleIcon,
  ExternalLinkIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Tabs, type TabItem } from '../../components/admin/ui/Tabs';
import { DataTable, type DataTableColumn } from '../../components/admin/ui/DataTable';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import {
  TrashDropdown,
  forceDeleteResource,
  restoreResource,
} from '../../components/admin/ui/TrashDropdown';
import { Drawer } from '../../components/admin/ui/Drawer';
import { SkeletonTable } from '../../components/admin/ui/Skeleton';
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '../../components/forms/Field';
import { api, firstErrorByField, ApiRequestError } from '../../lib/api';
import { useSeo } from '../../utils/seo';

type TabValue = 'all' | 'active' | 'inactive' | 'trash';

interface PartnerCategoryOption {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface AdminPartner {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  category?: PartnerCategoryOption | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  logo_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface PartnerFormState {
  name: string;
  slug: string;
  category_id: number | '';
  website: string;
  email: string;
  phone: string;
  description: string;
  logo: File | null;
  logo_preview: string | null;
  is_featured: boolean;
  is_active: boolean;
}

const emptyForm: PartnerFormState = {
  name: '',
  slug: '',
  category_id: '',
  website: '',
  email: '',
  phone: '',
  description: '',
  logo: null,
  logo_preview: null,
  is_featured: false,
  is_active: true,
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminPartners() {
  useSeo(
    'Partenaires | Administration Sincery Prestations',
    'Gestion des partenaires : fiches, logos, mise en avant et activation.'
  );

  const [rows, setRows] = useState<AdminPartner[]>([]);
  const [trashedRows, setTrashedRows] = useState<AdminPartner[]>([]);
  const [categories, setCategories] = useState<PartnerCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PartnerFormState>({ ...emptyForm });
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const [drawerErrors, setDrawerErrors] = useState<Record<string, string | null>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminPartner | null>(null);

  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
  const [pendingForceDelete, setPendingForceDelete] = useState<AdminPartner | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  const isViewingTrash = activeTab === 'trash';

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [partnersRes, trashedRes, catsRes] = await Promise.all([
        api.get<AdminPartner[] | { data: AdminPartner[] }>('/v1/partners'),
        api.get<AdminPartner[] | { data: AdminPartner[] }>('/v1/partners/trashed/list'),
        api.get<PartnerCategoryOption[] | { data: PartnerCategoryOption[] }>('/v1/partner-categories'),
      ]);
      setRows(Array.isArray(partnersRes) ? partnersRes : (partnersRes.data ?? []));
      setTrashedRows(Array.isArray(trashedRes) ? trashedRes : (trashedRes.data ?? []));
      setCategories(Array.isArray(catsRes) ? catsRes : (catsRes.data ?? []));
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Erreur de chargement';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const counts = useMemo(() => {
    const all = rows.length;
    const active = rows.filter((r) => r.is_active).length;
    const inactive = rows.filter((r) => !r.is_active).length;
    const trash = trashedRows.length;
    return { all, active, inactive, trash };
  }, [rows, trashedRows]);

  const workingRows = useMemo(() => {
    const source = isViewingTrash ? trashedRows : rows;
    let list = source.slice();
    if (!isViewingTrash) {
      if (activeTab === 'active') list = list.filter((r) => r.is_active);
      else if (activeTab === 'inactive') list = list.filter((r) => !r.is_active);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.email ?? '').toLowerCase().includes(q) ||
          (r.phone ?? '').toLowerCase().includes(q)
      );
    }
    if (filterCategoryId !== '') {
      list = list.filter((r) => r.category_id === filterCategoryId);
    }
    return list;
  }, [rows, trashedRows, isViewingTrash, activeTab, search, filterCategoryId]);

  const tabs: TabItem<TabValue>[] = [
    { value: 'all', label: 'Tous', count: counts.all },
    { value: 'active', label: 'Actifs', count: counts.active, tone: 'success' },
    { value: 'inactive', label: 'Inactifs', count: counts.inactive, tone: 'default' },
    { value: 'trash', label: 'Corbeille', count: counts.trash, tone: 'danger' },
  ];

  const headerDescription = `${counts.all} partenaire${counts.all > 1 ? 's' : ''} au total`;

  function openCreate() {
    setForm({ ...emptyForm });
    setDrawerErrors({});
    setDrawerMode('create');
    setEditingId(null);
    setDrawerOpen(true);
  }

  async function openEdit(row: AdminPartner) {
    setDrawerSubmitting(true);
    setDrawerErrors({});
    try {
      const detail = await api.get<AdminPartner>(`/v1/partners/show/${row.id}`);
      setForm({
        name: detail.name ?? '',
        slug: detail.slug ?? '',
        category_id: detail.category_id ?? '',
        website: detail.website ?? '',
        email: detail.email ?? '',
        phone: detail.phone ?? '',
        description: detail.description ?? '',
        logo: null,
        logo_preview: detail.logo_url ?? null,
        is_featured: detail.is_featured ?? false,
        is_active: detail.is_active ?? true,
      });
      setEditingId(row.id);
      setDrawerMode('edit');
      setDrawerOpen(true);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Erreur';
      toast.error(message);
    } finally {
      setDrawerSubmitting(false);
    }
  }

  function handleNameChange(name: string) {
    setForm((prev) => {
      if (drawerMode === 'edit') return { ...prev, name };
      return { ...prev, name, slug: slugify(name) };
    });
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({
          ...prev,
          logo_preview: (ev.target?.result as string) ?? null,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, logo_preview: editingId ? prev.logo_preview : null }));
    }
    setForm((prev) => ({ ...prev, logo: file }));
  }

  function clearLogo() {
    setForm((prev) => ({
      ...prev,
      logo: null,
      logo_preview: editingId ? prev.logo_preview : null,
    }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  function validateForm(): boolean {
    const errs: Record<string, string | null> = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis.';
    if (form.category_id === '') errs.category_id = 'La catégorie est requise.';
    if (form.website && !/^https?:\/\//i.test(form.website)) {
      errs.website = 'L\'URL doit commencer par http:// ou https://.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Adresse email invalide.';
    }
    setDrawerErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleDrawerSubmit() {
    if (!validateForm()) return;
    setDrawerSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug || slugify(form.name));
      if (form.category_id !== '') fd.append('category_id', String(form.category_id));
      if (form.website) fd.append('website', form.website);
      if (form.email) fd.append('email', form.email);
      if (form.phone) fd.append('phone', form.phone);
      if (form.description) fd.append('description', form.description);
      fd.append('is_featured', form.is_featured ? '1' : '0');
      fd.append('is_active', form.is_active ? '1' : '0');
      if (form.logo) fd.append('logo', form.logo);

      if (drawerMode === 'create') {
        const created = await api.post<AdminPartner>('/v1/partners', fd);
        setRows((prev) => [created, ...prev]);
        toast.success('Partenaire créé avec succès');
      } else if (editingId !== null) {
        const updated = await api.post<AdminPartner>(`/v1/partners/${editingId}`, fd);
        setRows((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        toast.success('Partenaire mis à jour');
      }
      setDrawerOpen(false);
    } catch (err) {
      if (err instanceof ApiRequestError && err.errors) {
        const mapped: Record<string, string | null> = {};
        for (const key of ['name', 'slug', 'category_id', 'website', 'email', 'phone']) {
          mapped[key] = firstErrorByField(err.errors, key);
        }
        setDrawerErrors(mapped);
      }
      const message = err instanceof ApiRequestError ? err.message : 'Erreur d\'enregistrement';
      toast.error(message);
    } finally {
      setDrawerSubmitting(false);
    }
  }

  function openDelete(row: AdminPartner) {
    setPendingDelete(row);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/v1/partners/${pendingDelete.id}`);
      setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      setTrashedRows((prev) => [
        { ...pendingDelete, deleted_at: new Date().toISOString() },
        ...prev.filter((r) => r.id !== pendingDelete.id),
      ]);
      toast.success(`${pendingDelete.name} mis à la corbeille`);
      setDeleteOpen(false);
      setPendingDelete(null);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Erreur';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  }

  function openForceDelete(row: AdminPartner) {
    setPendingForceDelete(row);
    setForceDeleteOpen(true);
  }

  async function handleForceDelete() {
    if (!pendingForceDelete) return;
    setForceDeleteLoading(true);
    try {
      await forceDeleteResource('partners', pendingForceDelete.id, pendingForceDelete.name);
      setTrashedRows((prev) => prev.filter((r) => r.id !== pendingForceDelete.id));
      setForceDeleteOpen(false);
      setPendingForceDelete(null);
    } catch {
      toast.error(`Impossible de supprimer ${pendingForceDelete.name}`);
    } finally {
      setForceDeleteLoading(false);
    }
  }

  async function handleRestore(row: AdminPartner) {
    try {
      await restoreResource('partners', row.id, row.name);
      setTrashedRows((prev) => prev.filter((r) => r.id !== row.id));
      setRows((prev) => [{ ...row, deleted_at: null }, ...prev]);
    } catch {
      toast.error(`Impossible de restaurer ${row.name}`);
    }
  }

  function handleMutated() {
    setTrashedRows([]);
    if (isViewingTrash) setActiveTab('all');
    void loadAll();
  }

  const columns: DataTableColumn<AdminPartner>[] = [
    {
      key: 'name',
      header: 'Nom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
            {row.logo_url ? (
              <img
                src={row.logo_url}
                alt=""
                loading="lazy"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand/5 font-bold text-brand">
                {row.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-black/90">{row.name}</span>
              {row.is_featured && (
                <StarIcon
                  className="h-3.5 w-3.5 fill-warning text-warning"
                  aria-label="À la une"
                />
              )}
            </div>
            <div className="mt-0.5 truncate text-xs text-black/50">
              <code className="rounded bg-surface-alt px-1.5 py-0.5 text-[11px]">{row.slug}</code>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      hideBelow: 'md',
      render: (row) => (
        <span className="text-sm text-black/65">{row.category?.name ?? '—'}</span>
      ),
    },
    {
      key: 'website',
      header: 'Site',
      hideBelow: 'lg',
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden />
            {new URL(row.website).hostname.replace(/^www\./, '')}
          </a>
        ) : (
          <span className="text-sm text-black/40">—</span>
        ),
    },
    {
      key: 'is_featured',
      header: 'À la une',
      hideBelow: 'md',
      render: (row) =>
        row.is_featured ? (
          <StatusBadge tone="warning">
            <StarIcon className="h-3.5 w-3.5 fill-current" aria-hidden />
            Oui
          </StatusBadge>
        ) : (
          <span className="text-sm text-black/40">Non</span>
        ),
    },
    {
      key: 'email',
      header: 'Email',
      hideBelow: 'lg',
      render: (row) =>
        row.email ? (
          <a
            href={`mailto:${row.email}`}
            className="inline-flex items-center gap-1 text-sm text-black/65 hover:text-brand hover:underline"
          >
            <MailIcon className="h-3.5 w-3.5" aria-hidden />
            <span className="truncate max-w-[180px]">{row.email}</span>
          </a>
        ) : (
          <span className="text-sm text-black/40">—</span>
        ),
    },
    {
      key: 'phone',
      header: 'Téléphone',
      hideBelow: 'lg',
      render: (row) =>
        row.phone ? (
          <a
            href={`tel:${row.phone}`}
            className="inline-flex items-center gap-1 text-sm text-black/65 hover:text-brand hover:underline"
          >
            <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
            <span>{row.phone}</span>
          </a>
        ) : (
          <span className="text-sm text-black/40">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (row) => (
        <StatusBadge tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? 'Actif' : 'Inactif'}
        </StatusBadge>
      ),
    },
    {
      key: 'logo',
      header: 'Logo',
      hideBelow: 'xl',
      mobileLabel: 'Logo',
      render: (row) =>
        row.logo_url ? (
          <div className="h-10 w-16 overflow-hidden rounded border border-line bg-white">
            <img
              src={row.logo_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <span className="text-sm text-black/40">Aucun</span>
        ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <AdminPageHeader
        title="Partenaires"
        description={headerDescription}
        actions={
          <>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Ajouter
            </Button>
            <TrashDropdown
              resource="partners"
              singularLabel="le partenaire"
              pluralLabel="partenaires"
              isViewingTrash={isViewingTrash}
              trashCount={counts.trash}
              onViewTrash={() => setActiveTab('trash')}
              onExitTrash={() => setActiveTab('all')}
              onMutated={handleMutated}
              size="sm"
            />
          </>
        }
      />

      <div className="mb-4">
        <Tabs<TabValue>
          value={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TextField
          name="partners-search"
          placeholder="Rechercher un partenaire…"
          icon={<SearchIcon className="h-4 w-4" aria-hidden />}
          value={search}
          onChange={(v: string) => setSearch(v)}
          className="flex-1 min-w-[220px] sm:min-w-[280px] md:max-w-sm"
        />
        {!isViewingTrash && (
          <SelectField
            name="partners-category-filter"
            emptyLabel="Toutes les catégories"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={filterCategoryId}
            onChange={(v: string) => setFilterCategoryId(v === '' ? '' : Number(v))}
            className="min-w-[200px]"
          />
        )}
      </div>

      {error ? (
        <AdminCard className="border-danger/30 bg-danger-bg/50 p-5">
          <div className="flex flex-wrap items-start gap-3">
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
            <div className="flex-1">
              <h3 className="font-semibold text-danger">Erreur de chargement</h3>
              <p className="mt-1 text-sm text-black/70">{error}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void loadAll()}
              iconLeft={<RefreshCwIcon className="h-4 w-4" aria-hidden />}
            >
              Réessayer
            </Button>
          </div>
        </AdminCard>
      ) : loading ? (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
          <div className="py-2">
            <SkeletonTable rows={6} columns={9} />
          </div>
        </div>
      ) : (
        <DataTable<AdminPartner>
          columns={columns}
          rows={workingRows}
          emptyTitle={
            isViewingTrash
              ? 'Corbeille vide'
              : activeTab === 'active'
                ? 'Aucun partenaire actif'
                : activeTab === 'inactive'
                  ? 'Aucun partenaire inactif'
                  : 'Aucun partenaire'
          }
          emptyHint={
            isViewingTrash
              ? 'Aucun partenaire supprimé récemment.'
              : 'Commencez par ajouter un partenaire.'
          }
          rowActions={
            isViewingTrash
              ? (row) => (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void handleRestore(row)}
                      iconLeft={<RefreshCwIcon className="h-4 w-4" aria-hidden />}
                    >
                      Restaurer
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openForceDelete(row)}
                      iconLeft={<Trash2Icon className="h-4 w-4" aria-hidden />}
                    >
                      Supprimer
                    </Button>
                  </>
                )
              : (row) => (
                  <>
                    <button
                      type="button"
                      aria-label={`Modifier ${row.name}`}
                      onClick={() => void openEdit(row)}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-surface-alt hover:text-brand"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Supprimer ${row.name}`}
                      onClick={() => openDelete(row)}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-danger-bg hover:text-danger"
                    >
                      <Trash2Icon className="h-4 w-4" aria-hidden />
                    </button>
                  </>
                )
          }
        />
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => !drawerSubmitting && setDrawerOpen(false)}
        title={drawerMode === 'create' ? 'Nouveau partenaire' : 'Modifier le partenaire'}
        description={
          drawerMode === 'create'
            ? 'Ajoutez un nouveau partenaire avec ses coordonnées et son logo.'
            : 'Mettez à jour les informations du partenaire.'
        }
        size="lg"
        dismissible={!drawerSubmitting}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={drawerSubmitting}
              onClick={() => setDrawerOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={drawerSubmitting}
              onClick={() => void handleDrawerSubmit()}
            >
              {drawerMode === 'create' ? 'Créer le partenaire' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nom"
            name="name"
            required
            value={form.name}
            onChange={(v: string) => handleNameChange(v)}
            error={drawerErrors.name ?? undefined}
            className="sm:col-span-2"
            placeholder="Nom du partenaire"
          />
          <TextField
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={(v: string) => setForm((prev) => ({ ...prev, slug: slugify(v) }))}
            error={drawerErrors.slug ?? undefined}
            className="sm:col-span-2"
            helpText="Généré automatiquement à partir du nom si laissé vide."
            placeholder="slug-partenaire"
          />
          <SelectField
            label="Catégorie"
            name="category_id"
            required
            emptyLabel="Sélectionner une catégorie"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={form.category_id}
            onChange={(v: string) => setForm((prev) => ({ ...prev, category_id: v === '' ? '' : Number(v) }))}
            error={drawerErrors.category_id ?? undefined}
          />
          <TextField
            label="Site web"
            name="website"
            type="url"
            value={form.website}
            onChange={(v: string) => setForm((prev) => ({ ...prev, website: v }))}
            error={drawerErrors.website ?? undefined}
            placeholder="https://exemple.com"
            helpText="Optionnel."
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(v: string) => setForm((prev) => ({ ...prev, email: v }))}
            error={drawerErrors.email ?? undefined}
            placeholder="contact@exemple.com"
            helpText="Optionnel."
          />
          <TextField
            label="Téléphone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(v: string) => setForm((prev) => ({ ...prev, phone: v }))}
            error={drawerErrors.phone ?? undefined}
            placeholder="+224 620 00 00 00"
            helpText="Optionnel."
          />
          <TextAreaField
            label="Description"
            name="description"
            rows={4}
            value={form.description}
            onChange={(v: string) => setForm((prev) => ({ ...prev, description: v }))}
            error={drawerErrors.description ?? undefined}
            className="sm:col-span-2"
            placeholder="Courte description du partenaire."
          />
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            <CheckboxField
              label="En vedette (À la une)"
              name="is_featured"
              checked={form.is_featured}
              onChange={(v: boolean) => setForm((prev) => ({ ...prev, is_featured: v }))}
            />
            <CheckboxField
              label="Actif (visible publiquement)"
              name="is_active"
              checked={form.is_active}
              onChange={(v: boolean) => setForm((prev) => ({ ...prev, is_active: v }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="partners-logo-input"
              className="mb-1.5 block text-sm text-black/65"
            >
              Logo
            </label>
            <div className="flex flex-wrap items-start gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-black/75 transition-colors hover:bg-surface-alt">
                <UploadIcon className="h-4 w-4" aria-hidden />
                <span>Choisir un fichier</span>
                <input
                  ref={logoInputRef}
                  id="partners-logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              {form.logo_preview && (
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
                  <img
                    src={form.logo_preview}
                    alt="Aperçu du logo"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="absolute top-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white transition-colors hover:bg-black/80"
                  >
                    Retirer
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-black/45">PNG, JPG, WebP. Optionnel.</p>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleDelete}
        tone="danger"
        loading={deleteLoading}
        dismissible={!deleteLoading}
        title={
          pendingDelete
            ? `Supprimer « ${pendingDelete.name} » ?`
            : 'Supprimer le partenaire ?'
        }
        description="Ce partenaire sera déplacé dans la corbeille. Vous pourrez le restaurer ou le supprimer définitivement ultérieurement."
        confirmLabel="Mettre à la corbeille"
      />

      <ConfirmDialog
        open={forceDeleteOpen}
        onClose={() => !forceDeleteLoading && setForceDeleteOpen(false)}
        onConfirm={handleForceDelete}
        tone="danger"
        loading={forceDeleteLoading}
        dismissible={!forceDeleteLoading}
        title={
          pendingForceDelete
            ? `Supprimer définitivement "${pendingForceDelete.name}" ?`
            : 'Supprimer définitivement ?'
        }
        description="Cette action est irréversible. Le partenaire et toutes ses données associées seront perdus."
        confirmLabel="Supprimer définitivement"
      />
    </motion.div>
  );
}
