import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  PencilIcon, PlusIcon, SearchIcon, Trash2Icon, RefreshCwIcon, ImageIcon } from 'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, type DataTableColumn } from '../../components/admin/ui/DataTable';
import { Tabs, type TabItem } from '../../components/admin/ui/Tabs';
import { Drawer } from '../../components/admin/ui/Drawer';
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog';
import { TrashDropdown, restoreResource, forceDeleteResource } from '../../components/admin/ui/TrashDropdown';
import { Skeleton } from '../../components/admin/ui/Skeleton';
import {
  TextField,
  TextAreaField,
  CheckboxField,
} from '../../components/forms/Field';
import { api } from '../../lib/api';
import type { ProductCategory } from '../../types/admin';
import { useSeo } from '../../utils/seo';

type CategoryTab = 'all' | 'active' | 'inactive' | 'trash';

interface CategoryFormValues {
  id?: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
  image: File | null;
  image_preview?: string | null;
}

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom ne peut dépasser 255 caractères'),
  slug: z.string().min(1, 'Le slug est requis').max(255, 'Le slug ne peut dépasser 255 caractères'),
  description: z.string().max(500, 'La description ne peut dépasser 500 caractères').nullable().optional(),
  sort_order: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0, "L'ordre doit être supérieur ou égal à 0").nullable(),
  ),
  is_active: z.boolean(),
  image: z.instanceof(File).nullable().optional(),
});

const defaultCategoryFormValues: CategoryFormValues = {
  name: '',
  slug: '',
  description: null,
  sort_order: null,
  is_active: true,
  image: null,
  image_preview: null,
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminCategories() {
  useSeo(
    'Catégories | Administration Sincery Prestations',
    'Gestion des catégories du catalogue produits : création, modification, ordre et statut.',
  );

  const [tab, setTab] = useState<CategoryTab>('all');
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trashCount, setTrashCount] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forceDeleteTarget, setForceDeleteTarget] = useState<ProductCategory | null>(null);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<ProductCategory | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as never,
    defaultValues: defaultCategoryFormValues,
  });

  const watchName = form.watch('name');

  useEffect(() => {
    if (!editingCategory && watchName) {
      const currentSlug = form.getValues('slug');
      if (!currentSlug || currentSlug === slugify(form.getValues('name').slice(0, -1))) {
        form.setValue('slug', slugify(watchName), { shouldValidate: true });
      }
    }
  }, [watchName, editingCategory, form]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const isTrash = tab === 'trash';
      const endpoint = isTrash ? '/v1/categories/trashed/list' : '/v1/categories';
      const data = await api.get<ProductCategory[]>(endpoint);
      setCategories(data);
      if (!isTrash) {
        const trashed = await api.get<ProductCategory[]>('/v1/categories/trashed/list');
        setTrashCount(trashed.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      toast.error('Erreur lors du chargement des catégories.', { description: message });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const tabs: TabItem<CategoryTab>[] = useMemo(() => [
    { value: 'all', label: 'Tous', count: categories.filter(c => !c.deleted_at).length },
    { value: 'active', label: 'Actifs', count: categories.filter(c => !c.deleted_at && c.is_active).length, tone: 'success' },
    { value: 'inactive', label: 'Inactifs', count: categories.filter(c => !c.deleted_at && !c.is_active).length, tone: 'warning' },
    { value: 'trash', label: 'Corbeille', count: trashCount, tone: 'danger' },
  ], [categories, trashCount]);

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      if (tab === 'active' && !c.is_active) return false;
      if (tab === 'inactive' && c.is_active) return false;
      if (tab === 'all' && c.deleted_at) return false;
      if (tab === 'trash' && !c.deleted_at) return false;

      const q = query.trim().toLowerCase();
      if (q) {
        const matchName = c.name.toLowerCase().includes(q);
        const matchSlug = c.slug.toLowerCase().includes(q);
        if (!matchName && !matchSlug) return false;
      }
      return true;
    });
  }, [categories, tab, query]);

  const counts = useMemo(() => {
    const all = categories.filter(c => !c.deleted_at);
    return {
      all: all.length,
      active: all.filter(c => c.is_active).length,
      inactive: all.filter(c => !c.is_active).length,
    };
  }, [categories]);

  const openCreate = () => {
    setEditingCategory(null);
    setImagePreview(null);
    form.reset({ ...defaultCategoryFormValues });
    setDrawerOpen(true);
  };

  const openEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setImagePreview(category.image_url ?? null);
    form.reset({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      sort_order: category.parent_id ?? null,
      is_active: category.is_active,
      image: null,
      image_preview: category.image_url ?? null,
    });
    setDrawerOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(editingCategory?.image_url ?? null);
    }
    form.setValue('image', file, { shouldValidate: true });
  };

  const clearImage = () => {
    form.setValue('image', null, { shouldValidate: true });
    setImagePreview(editingCategory?.image_url ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('slug', values.slug);
      if (values.description) formData.append('description', values.description);
      if (values.sort_order !== null) formData.append('sort_order', String(values.sort_order));
      formData.append('is_active', values.is_active ? '1' : '0');
      if (values.image) formData.append('image', values.image);
      formData.append('_method', editingCategory ? 'PUT' : 'POST');

      if (editingCategory) {
        await api.post(`/v1/categories/${editingCategory.id}`, formData);
        toast.success('Catégorie mise à jour', { description: `${values.name} a été modifiée avec succès.` });
      } else {
        await api.post('/v1/categories', formData);
        toast.success('Catégorie créée', { description: `${values.name} a été ajoutée avec succès.` });
      }
      setDrawerOpen(false);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error("Erreur lors de l'enregistrement.", { description: message });
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/v1/categories/${deleteTarget.id}`);
      toast.success('Catégorie supprimée', { description: `${deleteTarget.name} a été déplacée dans la corbeille.` });
      setDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('Erreur lors de la suppression.', { description: message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleForceDelete = async () => {
    if (!forceDeleteTarget) return;
    setForceDeleteLoading(true);
    try {
      await forceDeleteResource('categories', forceDeleteTarget.id, forceDeleteTarget.name);
      setForceDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('Erreur lors de la suppression définitive.', { description: message });
      setForceDeleteLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoreLoading(true);
    try {
      await restoreResource('categories', restoreTarget.id, restoreTarget.name);
      setRestoreTarget(null);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('Erreur lors de la restauration.', { description: message });
      setRestoreLoading(false);
    }
  };

  const columns: DataTableColumn<ProductCategory>[] = [
    {
      key: 'name',
      header: 'Nom',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <img
              src={row.image_url}
              alt=""
              loading="lazy"
              className="h-10 w-12 rounded-lg border border-line object-cover"
            />
          ) : (
            <span className="flex h-10 w-12 items-center justify-center rounded-lg border border-line bg-surface-alt text-black/30">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </span>
          )}
          <p className="text-base font-semibold text-black/90">{row.name}</p>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      hideBelow: 'md',
      render: (row) => (
        <span className="font-mono text-sm text-black/65">/{row.slug}</span>
      ),
    },
    {
      key: 'products_count',
      header: 'Produits',
      render: (row) => (
        <Link
          to={`/admin/produits?cat=${row.slug}`}
          className="inline-flex items-center rounded-sm bg-brand/10 px-2 py-0.5 text-sm font-medium text-brand hover:bg-brand/20"
        >
          {row.products_count ?? 0} produit{(row.products_count ?? 0) !== 1 ? 's' : ''}
        </Link>
      ),
    },
    {
      key: 'sort_order',
      header: 'Ordre',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-sm text-black/65">
          {row.parent_id !== null ? `N°${row.parent_id}` : '—'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Statut',
      render: (row) => (
        <StatusBadge tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? 'Actif' : 'Inactif'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <AdminPageHeader
        title="Catégories"
        description={`${counts.all} catégories dans le catalogue.`}
        actions={
          <>
            <TrashDropdown
              resource="categories"
              singularLabel="la catégorie"
              pluralLabel="catégories"
              isViewingTrash={tab === 'trash'}
              trashCount={trashCount}
              onViewTrash={() => setTab('trash')}
              onExitTrash={() => setTab('all')}
              onMutated={() => fetchCategories()}
              size="sm"
            />
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Ajouter une catégorie
            </Button>
          </>
        }
      />

      {error && !loading && (
        <AdminCard className="mb-6 border-danger/30 bg-danger-bg/50">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-base font-semibold text-danger">
                Erreur lors du chargement des catégories.
              </p>
              <p className="text-sm text-black/65">{error}</p>
            </div>
            <Button variant="primary" onClick={() => void fetchCategories()}>
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      <div className="mb-4">
        <Tabs<CategoryTab> tabs={tabs} value={tab} onChange={setTab} />
      </div>

      <AdminCard className="mb-4">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center">
          {loading ? (
            <Skeleton className="h-10 flex-1" />
          ) : (
            <div className="flex flex-1 items-center gap-2 rounded-md border border-line px-3 py-2">
              <SearchIcon className="h-4 w-4 shrink-0 text-black/45" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une catégorie…"
                aria-label="Rechercher une catégorie"
                className="w-full bg-transparent text-base outline-none placeholder:text-black/45"
              />
            </div>
          )}
        </div>
      </AdminCard>

      <DataTable<ProductCategory>
        columns={columns}
        rows={filtered}
        loading={loading}
        skeletonRows={8}
        emptyTitle={tab === 'trash' ? 'Corbeille vide' : 'Aucune catégorie'}
        emptyHint={
          tab === 'trash'
            ? 'Aucune catégorie dans la corbeille.'
            : 'Aucune catégorie ne correspond à ces critères.'
        }
        rowKey={(row) => row.id}
        rowActions={(row) =>
          tab === 'trash' ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setRestoreTarget(row)}
                iconLeft={<RefreshCwIcon className="h-4 w-4" aria-hidden />}
              >
                Restaurer
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setForceDeleteTarget(row)}
                iconLeft={<Trash2Icon className="h-4 w-4" aria-hidden />}
              >
                Supprimer
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openEdit(row)}
                aria-label={`Modifier ${row.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-surface-alt hover:text-brand"
              >
                <PencilIcon className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(row)}
                aria-label={`Supprimer ${row.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-danger-bg hover:text-danger"
              >
                <Trash2Icon className="h-4 w-4" aria-hidden />
              </button>
            </>
          )
        }
      />

      <Drawer
        open={drawerOpen}
        onClose={() => !submitting && setDrawerOpen(false)}
        title={editingCategory ? 'Modifier une catégorie' : 'Ajouter une catégorie'}
        description={
          editingCategory
            ? 'Modifiez les informations de la catégorie ci-dessous.'
            : 'Renseignez les informations pour créer une nouvelle catégorie.'
        }
        size="md"
        dismissible={!submitting}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDrawerOpen(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={() => void handleSubmit()}
            >
              {submitting ? 'Enregistrement…' : editingCategory ? 'Mettre à jour' : 'Créer la catégorie'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nom"
              name="name"
              required
              className="sm:col-span-2"
              placeholder="Nom de la catégorie"
              value={form.watch('name')}
              onChange={(v: string) => form.setValue('name', v, { shouldValidate: true })}
              error={(form.formState.errors.name?.message as string) ?? undefined}
            />
            <TextField
              label="Slug"
              name="slug"
              required
              className="sm:col-span-2"
              placeholder="slug-categorie"
              value={form.watch('slug')}
              onChange={(v: string) => form.setValue('slug', v, { shouldValidate: true })}
              error={(form.formState.errors.slug?.message as string) ?? undefined}
              helpText="Identifiant URL, généré automatiquement depuis le nom."
            />
            <TextAreaField
              label="Description"
              name="description"
              rows={4}
              className="sm:col-span-2"
              maxLength={500}
              placeholder="Description de la catégorie (max. 500 caractères)"
              value={form.watch('description') ?? ''}
              onChange={(v: string) =>
                form.setValue('description', v || null, { shouldValidate: true })
              }
              error={(form.formState.errors.description?.message as string) ?? undefined}
            />
            <TextField
              label="Ordre d'affichage"
              name="sort_order"
              type="number"
              min={0}
              placeholder="0"
              value={form.watch('sort_order') ?? ''}
              onChange={(v: string) =>
                form.setValue(
                  'sort_order',
                  v === '' || v === null ? null : Number(v),
                  { shouldValidate: true },
                )
              }
              error={(form.formState.errors.sort_order?.message as string) ?? undefined}
            />
            <div className="flex items-end">
              <CheckboxField
                label="Catégorie active"
                name="is_active"
                checked={form.watch('is_active')}
                onChange={(v: boolean) => form.setValue('is_active', v, { shouldValidate: true })}
                error={(form.formState.errors.is_active?.message as string) ?? undefined}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="category-image-input" className="mb-1.5 block text-sm text-black/65">
                Image de la catégorie
              </label>
              <div
                className="flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-line bg-surface-alt/20 text-sm text-black/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Aperçu" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearImage(); }}
                      className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
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
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDelete}
        tone="danger"
        loading={deleteLoading}
        dismissible={!deleteLoading}
        title={`Supprimer ${deleteTarget?.name ?? ''} ?`}
        description="Cette catégorie sera déplacée dans la corbeille. Vous pourrez la restaurer ultérieurement."
        confirmLabel="Déplacer dans la corbeille"
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        onClose={() => !forceDeleteLoading && setForceDeleteTarget(null)}
        onConfirm={handleForceDelete}
        tone="danger"
        loading={forceDeleteLoading}
        dismissible={!forceDeleteLoading}
        title={`Supprimer définitivement ${forceDeleteTarget?.name ?? ''} ?`}
        description="Cette action est irréversible. La catégorie sera supprimée définitivement ainsi que ses données associées."
        confirmLabel="Supprimer définitivement"
      />

      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => !restoreLoading && setRestoreTarget(null)}
        onConfirm={handleRestore}
        tone="confirm"
        loading={restoreLoading}
        dismissible={!restoreLoading}
        title={`Restaurer ${restoreTarget?.name ?? ''} ?`}
        description="La catégorie sera restaurée dans la liste des catégories actives."
        confirmLabel="Restaurer"
      />
    </motion.div>
  );
}
