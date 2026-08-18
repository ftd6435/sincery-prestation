import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircleIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
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
  TextAreaField,
  TextField,
} from '../../components/forms/Field';
import { api, firstErrorByField, ApiRequestError } from '../../lib/api';
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

type TabValue = 'all' | 'active' | 'inactive' | 'trash';

interface AdminPartnerCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  partners_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface PartnerCategoryFormState {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

const emptyForm: PartnerCategoryFormState = {
  name: '',
  slug: '',
  description: '',
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

export function AdminPartnerCategories() {
  useSeo(
    'Catégories de partenaires | Administration Sincery Prestations',
    'Gestion des catégories de partenaires : création, activation et archivage.'
  );

  const [rows, setRows] = useState<AdminPartnerCategory[]>([]);
  const [trashedRows, setTrashedRows] = useState<AdminPartnerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PartnerCategoryFormState>({ ...emptyForm });
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const [drawerErrors, setDrawerErrors] = useState<Record<string, string | null>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminPartnerCategory | null>(null);

  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
  const [pendingForceDelete, setPendingForceDelete] = useState<AdminPartnerCategory | null>(null);

  const isViewingTrash = activeTab === 'trash';

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, trashedRes] = await Promise.all([
        api.get<AdminPartnerCategory[] | { data: AdminPartnerCategory[] }>('/v1/partner-categories'),
        api.get<AdminPartnerCategory[] | { data: AdminPartnerCategory[] }>(
          '/v1/partner-categories/trashed/list'
        ),
      ]);
      setRows(Array.isArray(listRes) ? listRes : (listRes.data ?? []));
      setTrashedRows(Array.isArray(trashedRes) ? trashedRes : (trashedRes.data ?? []));
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
          r.slug.toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, trashedRows, isViewingTrash, activeTab, search]);

  const tabs: TabItem<TabValue>[] = [
    { value: 'all', label: 'Toutes', count: counts.all },
    { value: 'active', label: 'Actives', count: counts.active, tone: 'success' },
    { value: 'inactive', label: 'Inactives', count: counts.inactive, tone: 'default' },
    { value: 'trash', label: 'Corbeille', count: counts.trash, tone: 'danger' },
  ];

  const headerDescription = `${counts.all} catégorie${counts.all > 1 ? 's' : ''} de partenaires`;

  function openCreate() {
    setForm({ ...emptyForm });
    setDrawerErrors({});
    setDrawerMode('create');
    setEditingId(null);
    setDrawerOpen(true);
  }

  async function openEdit(row: AdminPartnerCategory) {
    setDrawerSubmitting(true);
    setDrawerErrors({});
    try {
      const detail = await api.get<AdminPartnerCategory>(`/v1/partner-categories/show/${row.id}`);
      setForm({
        name: detail.name ?? '',
        slug: detail.slug ?? '',
        description: detail.description ?? '',
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

  function validateForm(): boolean {
    const errs: Record<string, string | null> = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis.';
    setDrawerErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleDrawerSubmit() {
    if (!validateForm()) return;
    setDrawerSubmitting(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        is_active: form.is_active,
      };

      if (drawerMode === 'create') {
        const created = await api.post<AdminPartnerCategory>('/v1/partner-categories', payload);
        setRows((prev) => [created, ...prev]);
        toast.success('Catégorie créée avec succès');
      } else if (editingId !== null) {
        const updated = await api.put<AdminPartnerCategory>(
          `/v1/partner-categories/${editingId}`,
          payload
        );
        setRows((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        toast.success('Catégorie mise à jour');
      }
      setDrawerOpen(false);
    } catch (err) {
      if (err instanceof ApiRequestError && err.errors) {
        const mapped: Record<string, string | null> = {};
        for (const key of ['name', 'slug', 'description']) {
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

  function openDelete(row: AdminPartnerCategory) {
    setPendingDelete(row);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/v1/partner-categories/${pendingDelete.id}`);
      setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      setTrashedRows((prev) => [
        { ...pendingDelete, deleted_at: new Date().toISOString() },
        ...prev.filter((r) => r.id !== pendingDelete.id),
      ]);
      toast.success(`${pendingDelete.name} mise à la corbeille`);
      setDeleteOpen(false);
      setPendingDelete(null);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Erreur';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  }

  function openForceDelete(row: AdminPartnerCategory) {
    setPendingForceDelete(row);
    setForceDeleteOpen(true);
  }

  async function handleForceDelete() {
    if (!pendingForceDelete) return;
    setForceDeleteLoading(true);
    try {
      await forceDeleteResource(
        'partner-categories',
        pendingForceDelete.id,
        pendingForceDelete.name
      );
      setTrashedRows((prev) => prev.filter((r) => r.id !== pendingForceDelete.id));
      setForceDeleteOpen(false);
      setPendingForceDelete(null);
    } catch {
      toast.error(`Impossible de supprimer ${pendingForceDelete.name}`);
    } finally {
      setForceDeleteLoading(false);
    }
  }

  async function handleRestore(row: AdminPartnerCategory) {
    try {
      await restoreResource('partner-categories', row.id, row.name);
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

  const columns: DataTableColumn<AdminPartnerCategory>[] = [
    {
      key: 'name',
      header: 'Nom',
      render: (row) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-black/90">{row.name}</span>
            {!row.deleted_at && !row.is_active && (
              <StatusBadge tone="neutral">Inactive</StatusBadge>
            )}
          </div>
          {row.description && (
            <p className="mt-1 line-clamp-1 text-xs text-black/50">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      hideBelow: 'md',
      render: (row) => (
        <code className="rounded-sm bg-surface-alt px-2 py-0.5 text-sm text-black/70">
          {row.slug}
        </code>
      ),
    },
    {
      key: 'partners_count',
      header: 'Partenaires',
      render: (row) => (
        <span className="inline-flex items-center rounded-sm bg-black/5 px-2 py-0.5 text-sm font-medium text-black/70">
          {row.partners_count ?? 0}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Actif',
      render: (row) =>
        row.deleted_at ? null : (
          <StatusBadge tone={row.is_active ? 'success' : 'neutral'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </StatusBadge>
        ),
    },
    {
      key: 'created_at',
      header: 'Date',
      hideBelow: 'md',
      render: (row) =>
        row.created_at ? (
          <span className="text-sm text-black/65">{formatShortDate(row.created_at)}</span>
        ) : null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <AdminPageHeader
        title="Catégories de partenaires"
        description={headerDescription}
        actions={
          <>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Ajouter
            </Button>
            <TrashDropdown
              resource="partner-categories"
              singularLabel="la catégorie"
              pluralLabel="catégories de partenaires"
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
          name="partner-categories-search"
          placeholder="Rechercher une catégorie…"
          icon={<SearchIcon className="h-4 w-4" aria-hidden />}
          value={search}
          onChange={(v: string) => setSearch(v)}
          className="flex-1 min-w-[220px] sm:min-w-[280px] md:max-w-sm"
        />
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
            <SkeletonTable rows={6} columns={6} />
          </div>
        </div>
      ) : (
        <DataTable<AdminPartnerCategory>
          columns={columns}
          rows={workingRows}
          emptyTitle={
            isViewingTrash
              ? 'Corbeille vide'
              : activeTab === 'active'
                ? 'Aucune catégorie active'
                : activeTab === 'inactive'
                  ? 'Aucune catégorie inactive'
                  : 'Aucune catégorie'
          }
          emptyHint={
            isViewingTrash
              ? 'Aucun élément supprimé récemment.'
              : 'Commencez par ajouter une catégorie de partenaires.'
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
        title={drawerMode === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
        description={
          drawerMode === 'create'
            ? 'Créez une nouvelle catégorie pour organiser vos partenaires.'
            : 'Modifiez le nom, le slug et la visibilité de la catégorie.'
        }
        size="md"
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
              {drawerMode === 'create' ? 'Créer la catégorie' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <TextField
            label="Nom"
            name="name"
            required
            value={form.name}
            onChange={(v: string) => handleNameChange(v)}
            error={drawerErrors.name ?? undefined}
            placeholder="Nom de la catégorie"
          />
          <TextField
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={(v: string) => setForm((prev) => ({ ...prev, slug: slugify(v) }))}
            error={drawerErrors.slug ?? undefined}
            helpText="Généré automatiquement à partir du nom si laissé vide."
            placeholder="slug-categorie"
          />
          <TextAreaField
            label="Description"
            name="description"
            rows={4}
            value={form.description}
            onChange={(v: string) => setForm((prev) => ({ ...prev, description: v }))}
            error={drawerErrors.description ?? undefined}
            placeholder="Description optionnelle de la catégorie."
          />
          <CheckboxField
            label="Active (affichée publiquement)"
            name="is_active"
            checked={form.is_active}
            onChange={(v: boolean) => setForm((prev) => ({ ...prev, is_active: v }))}
          />
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
            : 'Supprimer la catégorie ?'
        }
        description="Cette catégorie sera déplacée dans la corbeille. Vous pourrez la restaurer ou la supprimer définitivement ultérieurement."
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
        description="Cette action est irréversible. La catégorie et toutes ses données associées seront perdues."
        confirmLabel="Supprimer définitivement"
      />
    </motion.div>
  );
}
