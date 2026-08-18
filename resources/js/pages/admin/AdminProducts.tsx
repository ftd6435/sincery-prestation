import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  PencilIcon, PlusIcon, SearchIcon, Trash2Icon, RefreshCwIcon, StarIcon, ImageIcon } from 'lucide-react';
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
  SelectField,
  TextAreaField,
  CheckboxField,
} from '../../components/forms/Field';
import { api } from '../../lib/api';
import type { Product as AdminProduct, ProductCategory } from '../../types/admin';
import { formatPrice } from '../../utils/format';
import { useSeo } from '../../utils/seo';

type ProductTab = 'all' | 'active' | 'inactive' | 'trash';

interface ProductFormValues {
  id?: number;
  name: string;
  slug: string;
  category_id: number | null;
  description: string | null;
  price: number | null;
  sku: string | null;
  stock_qty: number;
  is_featured: boolean;
  is_active: boolean;
  image: File | null;
  image_preview?: string | null;
}

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug doit contenir au moins 2 caractères'),
  category_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().nullable(),
  ),
  description: z.string().nullable().optional(),
  price: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().positive('Le prix doit être positif').nullable(),
  ),
  sku: z.string().nullable().optional(),
  stock_qty: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, 'Le stock doit être supérieur ou égal à 0'),
  ),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  image: z.instanceof(File).nullable().optional(),
});

const defaultProductFormValues: ProductFormValues = {
  name: '',
  slug: '',
  category_id: null,
  description: null,
  price: null,
  sku: null,
  stock_qty: 0,
  is_featured: false,
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

export function AdminProducts() {
  useSeo(
    'Produits | Administration Sincery Prestations',
    'Gestion du catalogue produits : création, modification, stock et statut de publication.',
  );

  const [tab, setTab] = useState<ProductTab>('all');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trashCount, setTrashCount] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forceDeleteTarget, setForceDeleteTarget] = useState<AdminProduct | null>(null);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<AdminProduct | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: defaultProductFormValues,
  });

  const watchName = form.watch('name');

  useEffect(() => {
    if (!editingProduct && watchName) {
      const currentSlug = form.getValues('slug');
      if (!currentSlug || currentSlug === slugify(form.getValues('name').slice(0, -1))) {
        form.setValue('slug', slugify(watchName), { shouldValidate: true });
      }
    }
  }, [watchName, editingProduct, form]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const isTrash = tab === 'trash';
      const endpoint = isTrash ? '/v1/products/trashed/list' : '/v1/products';
      const [productsData, categoriesData] = await Promise.all([
        api.get<AdminProduct[]>(endpoint),
        api.get<ProductCategory[]>('/v1/categories'),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      if (!isTrash) {
        const trashed = await api.get<AdminProduct[]>('/v1/products/trashed/list');
        setTrashCount(trashed.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      toast.error('Erreur lors du chargement des produits.', { description: message });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const tabs: TabItem<ProductTab>[] = useMemo(() => [
    { value: 'all', label: 'Tous', count: products.filter(p => !p.deleted_at).length },
    { value: 'active', label: 'Actifs', count: products.filter(p => !p.deleted_at && p.is_published).length, tone: 'success' },
    { value: 'inactive', label: 'Inactifs', count: products.filter(p => !p.deleted_at && !p.is_published).length, tone: 'warning' },
    { value: 'trash', label: 'Corbeille', count: trashCount, tone: 'danger' },
  ], [products, trashCount]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (tab === 'active' && !p.is_published) return false;
      if (tab === 'inactive' && p.is_published) return false;
      if (tab === 'all' && p.deleted_at) return false;
      if (tab === 'trash' && !p.deleted_at) return false;

      const q = query.trim().toLowerCase();
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = (p.reference ?? '').toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }
      if (categoryFilter) {
        const catId = Number(categoryFilter);
        if (p.category_id !== catId) return false;
      }
      return true;
    });
  }, [products, tab, query, categoryFilter]);

  const counts = useMemo(() => {
    const all = products.filter(p => !p.deleted_at);
    return {
      all: all.length,
      active: all.filter(p => p.is_published).length,
      inactive: all.filter(p => !p.is_published).length,
    };
  }, [products]);

  const openCreate = () => {
    setEditingProduct(null);
    setImagePreview(null);
    form.reset({ ...defaultProductFormValues });
    setDrawerOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setImagePreview(product.thumbnail_url ?? null);
    form.reset({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category_id: product.category_id,
      description: product.description ?? null,
      price: product.price,
      sku: product.reference ?? null,
      stock_qty: product.stock,
      is_featured: product.is_featured,
      is_active: product.is_published,
      image: null,
      image_preview: product.thumbnail_url ?? null,
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
      setImagePreview(editingProduct?.thumbnail_url ?? null);
    }
    form.setValue('image', file, { shouldValidate: true });
  };

  const clearImage = () => {
    form.setValue('image', null, { shouldValidate: true });
    setImagePreview(editingProduct?.thumbnail_url ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('slug', values.slug);
      if (values.category_id !== null) formData.append('category_id', String(values.category_id));
      if (values.description) formData.append('description', values.description);
      if (values.price !== null) formData.append('price', String(values.price));
      if (values.sku) formData.append('sku', values.sku);
      formData.append('stock_qty', String(values.stock_qty));
      formData.append('is_featured', values.is_featured ? '1' : '0');
      formData.append('is_active', values.is_active ? '1' : '0');
      if (values.image) formData.append('image', values.image);
      formData.append('_method', editingProduct ? 'PUT' : 'POST');

      if (editingProduct) {
        await api.post(`/v1/products/update/${editingProduct.id}`, formData);
        toast.success('Produit mis à jour', { description: `${values.name} a été modifié avec succès.` });
      } else {
        await api.post('/v1/products/store', formData);
        toast.success('Produit créé', { description: `${values.name} a été ajouté au catalogue.` });
      }
      setDrawerOpen(false);
      await fetchProducts();
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
      await api.delete(`/v1/products/destroy/${deleteTarget.id}`);
      toast.success('Produit supprimé', { description: `${deleteTarget.name} a été déplacé dans la corbeille.` });
      setDeleteTarget(null);
      await fetchProducts();
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
      await forceDeleteResource('products', forceDeleteTarget.id, forceDeleteTarget.name);
      setForceDeleteTarget(null);
      await fetchProducts();
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
      await restoreResource('products', restoreTarget.id, restoreTarget.name);
      setRestoreTarget(null);
      await fetchProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('Erreur lors de la restauration.', { description: message });
      setRestoreLoading(false);
    }
  };

  const columns: DataTableColumn<AdminProduct>[] = [
    {
      key: 'name',
      header: 'Nom',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnail_url ? (
            <img
              src={row.thumbnail_url}
              alt=""
              loading="lazy"
              className="h-10 w-10 rounded-lg border border-line object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface-alt text-black/30">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-black/90">
              {row.name}
              {row.is_featured && (
                <span className="ml-2 inline-flex items-center gap-0.5 rounded-sm bg-warning-bg px-1.5 py-0.5 text-xs font-medium text-warning">
                  <StarIcon className="h-3 w-3" aria-hidden />
                  Vedette
                </span>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'reference',
      header: 'SKU',
      hideBelow: 'md',
      render: (row) => (
        <span className="font-mono text-sm text-black/65">{row.reference ?? '—'}</span>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-sm text-black/65">{row.category?.name ?? '—'}</span>
      ),
    },
    {
      key: 'price',
      header: 'Prix',
      render: (row) => (
        <span className="font-semibold text-black/90">{formatPrice(row.price)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => {
        const tone: 'success' | 'warning' | 'danger' =
          row.stock === 0 ? 'danger' : row.stock < 10 ? 'warning' : 'success';
        return (
          <StatusBadge tone={tone}>
            {row.stock} {row.unit ?? 'unités'}
          </StatusBadge>
        );
      },
    },
    {
      key: 'is_published',
      header: 'Statut',
      render: (row) => (
        <StatusBadge tone={row.is_published ? 'success' : 'neutral'}>
          {row.is_published ? 'Actif' : 'Inactif'}
        </StatusBadge>
      ),
    },
  ];

  const categoryOptions = useMemo(() =>
    categories.map((c) => ({ value: String(c.id), label: c.name })),
  [categories]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <AdminPageHeader
        title="Produits"
        description={`${counts.all} références dans le catalogue.`}
        actions={
          <>
            <TrashDropdown
              resource="products"
              singularLabel="le produit"
              pluralLabel="produits"
              isViewingTrash={tab === 'trash'}
              trashCount={trashCount}
              onViewTrash={() => setTab('trash')}
              onExitTrash={() => setTab('all')}
              onMutated={() => fetchProducts()}
              size="sm"
            />
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Ajouter un produit
            </Button>
          </>
        }
      />

      {error && !loading && (
        <AdminCard className="mb-6 border-danger/30 bg-danger-bg/50">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-base font-semibold text-danger">
                Erreur lors du chargement des produits.
              </p>
              <p className="text-sm text-black/65">{error}</p>
            </div>
            <Button variant="primary" onClick={() => void fetchProducts()}>
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      <div className="mb-4">
        <Tabs<ProductTab> tabs={tabs} value={tab} onChange={setTab} />
      </div>

      <AdminCard className="mb-4">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center">
          {loading ? (
            <>
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-56" />
            </>
          ) : (
            <>
              <div className="flex flex-1 items-center gap-2 rounded-md border border-line px-3 py-2">
                <SearchIcon className="h-4 w-4 shrink-0 text-black/45" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un produit ou une référence…"
                  aria-label="Rechercher un produit"
                  className="w-full bg-transparent text-base outline-none placeholder:text-black/45"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filtrer par catégorie"
                className="rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-brand"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </AdminCard>

      <DataTable<AdminProduct>
        columns={columns}
        rows={filtered}
        loading={loading}
        skeletonRows={8}
        emptyTitle={tab === 'trash' ? 'Corbeille vide' : 'Aucun produit'}
        emptyHint={
          tab === 'trash'
            ? 'Aucun produit dans la corbeille.'
            : 'Aucun produit ne correspond à ces critères.'
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
        title={editingProduct ? 'Modifier un produit' : 'Ajouter un produit'}
        description={
          editingProduct
            ? 'Modifiez les informations du produit ci-dessous.'
            : 'Renseignez les informations pour créer un nouveau produit.'
        }
        size="lg"
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
              {submitting ? 'Enregistrement…' : editingProduct ? 'Mettre à jour' : 'Créer le produit'}
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
              placeholder="Nom du produit"
              value={form.watch('name')}
              onChange={(v: string) => form.setValue('name', v, { shouldValidate: true })}
              error={(form.formState.errors.name?.message as string) ?? undefined}
            />
            <TextField
              label="Slug"
              name="slug"
              required
              placeholder="slug-du-produit"
              value={form.watch('slug')}
              onChange={(v: string) => form.setValue('slug', v, { shouldValidate: true })}
              error={(form.formState.errors.slug?.message as string) ?? undefined}
              helpText="Identifiant URL, généré automatiquement depuis le nom."
            />
            <SelectField
              label="Catégorie"
              name="category_id"
              emptyLabel="Sélectionner une catégorie"
              options={categoryOptions}
              value={form.watch('category_id') === null ? '' : String(form.watch('category_id') ?? '')}
              onChange={(v: string) =>
                form.setValue('category_id', v === '' ? null : Number(v), { shouldValidate: true })
              }
              error={(form.formState.errors.category_id?.message as string) ?? undefined}
            />
            <TextField
              label="Référence / SKU"
              name="sku"
              placeholder="Ex : PROD-001"
              value={form.watch('sku') ?? ''}
              onChange={(v: string) => form.setValue('sku', v || null, { shouldValidate: true })}
              error={(form.formState.errors.sku?.message as string) ?? undefined}
            />
            <TextField
              label="Prix"
              name="price"
              type="number"
              step="0.01"
              suffix="GNF"
              placeholder="0"
              value={form.watch('price') ?? ''}
              onChange={(v: string) =>
                form.setValue('price', v === '' || v === null ? null : Number(v), { shouldValidate: true })
              }
              error={(form.formState.errors.price?.message as string) ?? undefined}
            />
            <TextField
              label="Stock"
              name="stock_qty"
              type="number"
              placeholder="0"
              value={form.watch('stock_qty')}
              onChange={(v: string) =>
                form.setValue('stock_qty', Number(v) || 0, { shouldValidate: true })
              }
              error={(form.formState.errors.stock_qty?.message as string) ?? undefined}
            />
            <TextAreaField
              label="Description"
              name="description"
              rows={5}
              className="sm:col-span-2"
              placeholder="Description détaillée du produit"
              value={form.watch('description') ?? ''}
              onChange={(v: string) =>
                form.setValue('description', v || null, { shouldValidate: true })
              }
              error={(form.formState.errors.description?.message as string) ?? undefined}
            />
            <div className="sm:col-span-2 grid gap-3 rounded-md border border-line bg-surface-alt/30 p-4 sm:grid-cols-2">
              <CheckboxField
                label="Produit en vedette"
                name="is_featured"
                checked={form.watch('is_featured')}
                onChange={(v: boolean) => form.setValue('is_featured', v, { shouldValidate: true })}
              />
              <CheckboxField
                label="Actif (publié)"
                name="is_active"
                checked={form.watch('is_active')}
                onChange={(v: boolean) => form.setValue('is_active', v, { shouldValidate: true })}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="product-image-input" className="mb-1.5 block text-sm text-black/65">
                Image du produit
              </label>
              <div
                className="flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-line bg-surface-alt/20 text-sm text-black/50"
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
                id="product-image-input"
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
        description="Ce produit sera déplacé dans la corbeille. Vous pourrez le restaurer ultérieurement."
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
        description="Cette action est irréversible. Le produit sera supprimé définitivement ainsi que ses données associées."
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
        description="Le produit sera restauré dans la liste des produits actifs."
        confirmLabel="Restaurer"
      />
    </motion.div>
  );
}
