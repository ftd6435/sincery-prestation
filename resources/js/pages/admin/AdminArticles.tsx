import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircleIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
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
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

type TabValue = 'all' | 'active' | 'inactive' | 'trash';
type PostStatus = 'pending' | 'approved';

interface PostCategoryOption {
  id: number;
  name: string;
  is_active: boolean;
}

interface AuthorOption {
  id: number;
  name: string;
}

interface AdminPost {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  category?: PostCategoryOption | null;
  author_id: number | null;
  author_name?: string | null;
  excerpt: string | null;
  content: string | null;
  status: PostStatus;
  is_active: boolean;
  featured_image_url: string | null;
  views_count: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface PostsListResponse {
  data: AdminPost[];
  meta?: { total?: number };
}

interface PostFormState {
  title: string;
  slug: string;
  category_id: number | '';
  excerpt: string;
  content: string;
  author_id: number | '';
  status: PostStatus;
  is_active: boolean;
  featured_image: File | null;
  featured_image_preview: string | null;
}

const emptyForm: PostFormState = {
  title: '',
  slug: '',
  category_id: '',
  excerpt: '',
  content: '',
  author_id: '',
  status: 'pending',
  is_active: true,
  featured_image: null,
  featured_image_preview: null,
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminArticles() {
  useSeo(
    'Articles | Administration Sincery Prestations',
    'Gestion des articles du blog : rédaction, publication et mise à la corbeille.'
  );

  const [rows, setRows] = useState<AdminPost[]>([]);
  const [trashedRows, setTrashedRows] = useState<AdminPost[]>([]);
  const [categories, setCategories] = useState<PostCategoryOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PostFormState>({ ...emptyForm });
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const [drawerErrors, setDrawerErrors] = useState<Record<string, string | null>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminPost | null>(null);

  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
  const [pendingForceDelete, setPendingForceDelete] = useState<AdminPost | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isViewingTrash = activeTab === 'trash';

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.get<PostsListResponse>('/v1/posts'),
        api.get<PostsListResponse>('/v1/posts/trashed/list'),
        api.get<{ data: PostCategoryOption[] } | PostCategoryOption[]>('/v1/post-categories'),
        api.get<{ data: AuthorOption[] } | AuthorOption[]>('/v1/admin/users'),
      ]);

      const unwrap = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
        r.status === 'fulfilled' ? r.value : fallback;

      const postsRes = unwrap<PostsListResponse>(results[0], [] as unknown as PostsListResponse);
      const trashedRes = unwrap<PostsListResponse>(results[1], [] as unknown as PostsListResponse);
      const catsRes = unwrap(results[2], [] as unknown as PostCategoryOption[]);
      const usersRes = unwrap(results[3], [] as unknown as AuthorOption[]);

      setRows(Array.isArray(postsRes) ? postsRes : (postsRes.data ?? []));
      setTrashedRows(Array.isArray(trashedRes) ? trashedRes : (trashedRes.data ?? []));
      setCategories(Array.isArray(catsRes) ? catsRes : (catsRes.data ?? []));
      setAuthors(Array.isArray(usersRes) ? usersRes : (usersRes.data ?? []));
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
          r.title.toLowerCase().includes(q) ||
          (r.excerpt ?? '').toLowerCase().includes(q) ||
          (r.author_name ?? '').toLowerCase().includes(q)
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

  const headerDescription = `${counts.all} article${counts.all > 1 ? 's' : ''} au total`;

  function openCreate() {
    setForm({ ...emptyForm });
    setDrawerErrors({});
    setDrawerMode('create');
    setEditingId(null);
    setDrawerOpen(true);
  }

  async function openEdit(row: AdminPost) {
    setDrawerSubmitting(true);
    setDrawerErrors({});
    try {
      const detail = await api.get<AdminPost>(`/v1/posts/${row.id}`);
      setForm({
        title: detail.title ?? '',
        slug: detail.slug ?? '',
        category_id: detail.category_id ?? '',
        excerpt: detail.excerpt ?? '',
        content: detail.content ?? '',
        author_id: detail.author_id ?? '',
        status: (detail.status as PostStatus) ?? 'pending',
        is_active: detail.is_active ?? true,
        featured_image: null,
        featured_image_preview: detail.featured_image_url ?? null,
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

  function handleTitleChange(title: string) {
    setForm((prev) => {
      if (drawerMode === 'edit') return { ...prev, title };
      return { ...prev, title, slug: slugify(title) };
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({
          ...prev,
          featured_image_preview: (ev.target?.result as string) ?? null,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({
        ...prev,
        featured_image_preview: editingId ? prev.featured_image_preview : null,
      }));
    }
    setForm((prev) => ({ ...prev, featured_image: file }));
  }

  function clearFile() {
    setForm((prev) => ({
      ...prev,
      featured_image: null,
      featured_image_preview: editingId ? prev.featured_image_preview : null,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validateForm(): boolean {
    const errs: Record<string, string | null> = {};
    if (!form.title.trim()) errs.title = 'Le titre est requis.';
    if (form.category_id === '') errs.category_id = 'La catégorie est requise.';
    if (form.author_id === '') errs.author_id = "L'auteur est requis.";
    if (!form.excerpt.trim()) errs.excerpt = "L'extrait est requis.";
    if (!form.content.trim()) errs.content = 'Le contenu est requis.';
    setDrawerErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleDrawerSubmit() {
    if (!validateForm()) return;
    setDrawerSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('slug', form.slug || slugify(form.title));
      if (form.category_id !== '') fd.append('category_id', String(form.category_id));
      if (form.author_id !== '') fd.append('author_id', String(form.author_id));
      fd.append('excerpt', form.excerpt);
      fd.append('content', form.content);
      fd.append('status', form.status);
      fd.append('is_active', form.is_active ? '1' : '0');
      if (form.featured_image) fd.append('featured_image', form.featured_image);

      if (drawerMode === 'create') {
        const created = await api.post<AdminPost>('/v1/posts', fd);
        setRows((prev) => [created, ...prev]);
        toast.success('Article créé avec succès');
      } else if (editingId !== null) {
        const updated = await api.post<AdminPost>(`/v1/posts/${editingId}`, fd);
        setRows((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        toast.success('Article mis à jour');
      }
      setDrawerOpen(false);
    } catch (err) {
      if (err instanceof ApiRequestError && err.errors) {
        const mapped: Record<string, string | null> = {};
        for (const key of ['title', 'slug', 'category_id', 'author_id', 'excerpt', 'content', 'status']) {
          mapped[key] = firstErrorByField(err.errors, key);
        }
        setDrawerErrors(mapped);
      }
      const message = err instanceof ApiRequestError ? err.message : "Erreur d'enregistrement";
      toast.error(message);
    } finally {
      setDrawerSubmitting(false);
    }
  }

  function openDelete(row: AdminPost) {
    setPendingDelete(row);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/v1/posts/${pendingDelete.id}`);
      setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      setTrashedRows((prev) => [
        { ...pendingDelete, deleted_at: new Date().toISOString() },
        ...prev.filter((r) => r.id !== pendingDelete.id),
      ]);
      toast.success(`${pendingDelete.title} mis à la corbeille`);
      setDeleteOpen(false);
      setPendingDelete(null);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Erreur';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  }

  function openForceDelete(row: AdminPost) {
    setPendingForceDelete(row);
    setForceDeleteOpen(true);
  }

  async function handleForceDelete() {
    if (!pendingForceDelete) return;
    setForceDeleteLoading(true);
    try {
      await forceDeleteResource('posts', pendingForceDelete.id, pendingForceDelete.title);
      setTrashedRows((prev) => prev.filter((r) => r.id !== pendingForceDelete.id));
      setForceDeleteOpen(false);
      setPendingForceDelete(null);
    } catch {
      toast.error(`Impossible de supprimer ${pendingForceDelete.title}`);
    } finally {
      setForceDeleteLoading(false);
    }
  }

  async function handleRestore(row: AdminPost) {
    try {
      await restoreResource('posts', row.id, row.title);
      setTrashedRows((prev) => prev.filter((r) => r.id !== row.id));
      setRows((prev) => [{ ...row, deleted_at: null }, ...prev]);
    } catch {
      toast.error(`Impossible de restaurer ${row.title}`);
    }
  }

  function handleMutated() {
    setTrashedRows([]);
    if (isViewingTrash) setActiveTab('all');
    void loadAll();
  }

  const statusTone = (s: PostStatus) => (s === 'approved' ? 'success' : 'warning');
  const statusLabel = (s: PostStatus) => (s === 'approved' ? 'Approuvé' : 'En attente');

  const columns: DataTableColumn<AdminPost>[] = [
    {
      key: 'title',
      header: 'Titre',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-alt">
            {row.featured_image_url ? (
              <img
                src={row.featured_image_url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-black/30">
                <EyeIcon className="h-4 w-4" aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-black/90">{row.title}</div>
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
      hideBelow: 'lg',
      render: (row) => <span className="text-sm text-black/65">{row.category?.name ?? '—'}</span>,
    },
    {
      key: 'author_name',
      header: 'Auteur',
      hideBelow: 'md',
      render: (row) => <span className="text-sm text-black/65">{row.author_name ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Statut',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusTone(row.status)}>{statusLabel(row.status)}</StatusBadge>
          {!row.deleted_at && !row.is_active && <StatusBadge tone="neutral">Désactivé</StatusBadge>}
        </div>
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
    {
      key: 'views_count',
      header: 'Vues',
      hideBelow: 'lg',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-sm text-black/65">
          <EyeIcon className="h-3.5 w-3.5" aria-hidden />
          {row.views_count ?? 0}
        </span>
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
        title="Articles"
        description={headerDescription}
        actions={
          <>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Ajouter
            </Button>
            <TrashDropdown
              resource="posts"
              singularLabel="l'article"
              pluralLabel="articles"
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
        <Tabs<TabValue> value={activeTab} onChange={setActiveTab} tabs={tabs} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TextField
          name="articles-search"
          placeholder="Rechercher un article…"
          icon={<SearchIcon className="h-4 w-4" aria-hidden />}
          value={search}
          onChange={(v: string) => setSearch(v)}
          className="flex-1 min-w-[220px] sm:min-w-[280px] md:max-w-sm"
        />
        {!isViewingTrash && (
          <SelectField
            name="articles-category-filter"
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
            <SkeletonTable rows={6} columns={7} />
          </div>
        </div>
      ) : (
        <DataTable<AdminPost>
          columns={columns}
          rows={workingRows}
          emptyTitle={
            isViewingTrash
              ? 'Corbeille vide'
              : activeTab === 'active'
                ? 'Aucun article actif'
                : activeTab === 'inactive'
                  ? 'Aucun article inactif'
                  : 'Aucun article'
          }
          emptyHint={
            isViewingTrash ? 'Aucun article supprimé récemment.' : 'Commencez par ajouter un article.'
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
                      aria-label={`Modifier ${row.title}`}
                      onClick={() => void openEdit(row)}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-surface-alt hover:text-brand"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Supprimer ${row.title}`}
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
        title={drawerMode === 'create' ? 'Nouvel article' : "Modifier l'article"}
        description={
          drawerMode === 'create'
            ? 'Rédigez un nouvel article du blog.'
            : "Modifiez le contenu et les paramètres de l'article."
        }
        size="lg"
        dismissible={!drawerSubmitting}
        footer={
          <>
            <Button variant="ghost" size="sm" disabled={drawerSubmitting} onClick={() => setDrawerOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={drawerSubmitting}
              onClick={() => void handleDrawerSubmit()}
            >
              {drawerMode === 'create' ? "Créer l'article" : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Titre"
            name="title"
            required
            value={form.title}
            onChange={(v: string) => handleTitleChange(v)}
            error={drawerErrors.title ?? undefined}
            className="sm:col-span-2"
            placeholder="Titre de l'article"
          />
          <TextField
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={(v: string) => setForm((prev) => ({ ...prev, slug: slugify(v) }))}
            error={drawerErrors.slug ?? undefined}
            className="sm:col-span-2"
            helpText="Généré automatiquement à partir du titre si laissé vide."
            placeholder="slug-url-de-larticle"
          />
          <SelectField
            label="Catégorie"
            name="category_id"
            required
            emptyLabel="Sélectionner une catégorie"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={form.category_id}
            onChange={(v: string) =>
              setForm((prev) => ({ ...prev, category_id: v === '' ? '' : Number(v) }))
            }
            error={drawerErrors.category_id ?? undefined}
          />
          <SelectField
            label="Auteur"
            name="author_id"
            required
            emptyLabel="Sélectionner un auteur"
            options={authors.map((a) => ({ value: a.id, label: a.name }))}
            value={form.author_id}
            onChange={(v: string) =>
              setForm((prev) => ({ ...prev, author_id: v === '' ? '' : Number(v) }))
            }
            error={drawerErrors.author_id ?? undefined}
          />
          <TextAreaField
            label="Extrait"
            name="excerpt"
            required
            rows={3}
            value={form.excerpt}
            onChange={(v: string) => setForm((prev) => ({ ...prev, excerpt: v }))}
            error={drawerErrors.excerpt ?? undefined}
            className="sm:col-span-2"
            placeholder="Courte description affichée dans les listes."
          />
          <TextAreaField
            label="Contenu"
            name="content"
            required
            rows={12}
            value={form.content}
            onChange={(v: string) => setForm((prev) => ({ ...prev, content: v }))}
            error={drawerErrors.content ?? undefined}
            className="sm:col-span-2"
            placeholder="Contenu complet de l'article."
          />
          <SelectField
            label="Statut"
            name="status"
            emptyLabel={null}
            options={[
              { value: 'pending', label: 'En attente' },
              { value: 'approved', label: 'Approuvé' },
            ]}
            value={form.status}
            onChange={(v: string) => setForm((prev) => ({ ...prev, status: v as PostStatus }))}
            error={drawerErrors.status ?? undefined}
          />
          <div className="grid gap-4 content-start">
            <CheckboxField
              label="Actif (visible publiquement)"
              name="is_active"
              checked={form.is_active}
              onChange={(v: boolean) => setForm((prev) => ({ ...prev, is_active: v }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="articles-featured-input"
              className="mb-1.5 block text-sm text-black/65"
            >
              Image à la une
            </label>
            <div className="h-48 w-full overflow-hidden rounded-md border-2 border-dashed border-line bg-surface-alt/20">
              <div
                className="flex h-full w-full cursor-pointer items-center justify-center relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.featured_image_preview ? (
                  <>
                    <img
                      src={form.featured_image_preview}
                      alt="Aperçu"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white transition-colors hover:bg-black/80"
                    >
                      Retirer
                    </button>
                  </>
                ) : (
                  <div className="text-center text-sm text-black/50 pointer-events-none">
                    <UploadIcon className="mx-auto h-6 w-6 mb-1" aria-hidden />
                    <p className="font-medium">Cliquez pour télécharger une image</p>
                    <p className="mt-1 text-xs">PNG, JPG, WebP (max 10 Mo)</p>
                  </div>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="articles-featured-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
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
        title={pendingDelete ? `Supprimer "${pendingDelete.title}" ?` : "Supprimer l'article ?"}
        description="Cet article sera déplacé dans la corbeille. Vous pourrez le restaurer ou le supprimer définitivement ultérieurement."
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
            ? `Supprimer définitivement "${pendingForceDelete.title}" ?`
            : 'Supprimer définitivement ?'
        }
        description="Cette action est irréversible. L'article et toutes ses données associées seront perdus."
        confirmLabel="Supprimer définitivement"
      />
    </motion.div>
  );
}
