import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckIcon,
  ImageIcon,
  Loader2Icon,
  RefreshCwIcon,
  SaveIcon,
  UploadIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useSeo } from '../../utils/seo';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import {
  CheckboxField,
  TextAreaField,
  TextField,
} from '../../components/forms/Field';
import type { SettingRow, SettingType } from '../../types/admin';

interface SettingRowWithGroup extends SettingRow {
  group?: string | null;
  label?: string | null;
  description?: string | null;
}

const groupLabels: Record<string, string> = {
  general: 'Général',
  company: 'Entreprise',
  contact: 'Contact',
  social: 'Réseaux sociaux',
  content: 'Contenu éditable',
  notifications: 'Notifications',
  seo: 'Référencement SEO',
  mail: 'Email / SMTP',
  media: 'Médias',
};

const defaultGroupLabel = 'Divers';

function displayGroup(g: string | null | undefined): string {
  if (!g) return defaultGroupLabel;
  return groupLabels[g] ?? g.charAt(0).toUpperCase() + g.slice(1).replace(/_/g, ' ');
}

function formatJsonSyntaxHint(): string {
  return 'Format JSON attendu : { "cle": "valeur", "tableau": [1, 2, 3] }. Utilisez des guillemets doubles.';
}

function isJsonStringValid(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

export function AdminSettings() {
  useSeo(
    'Paramètres | Administration Sincery Prestations',
    'Paramètres généraux du site : coordonnées, réseaux sociaux, contenus éditables et notifications.'
  );

  const [settings, setSettings] = useState<SettingRowWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());
  const [localValues, setLocalValues] = useState<Record<number, unknown>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<number, string | null>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<SettingRowWithGroup[]>('/v1/settings');
      const list = Array.isArray(data) ? data : [];
      setSettings(list);
      const values: Record<number, unknown> = {};
      list.forEach((s) => {
        values[s.id] = s.value;
      });
      setLocalValues(values);
      setDirtyIds(new Set());
      setJsonErrors({});
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const grouped = useMemo(() => {
    const groups: Record<string, SettingRowWithGroup[]> = {};
    settings.forEach((s) => {
      const g = s.group ?? '';
      if (!groups[g]) groups[g] = [];
      groups[g].push(s);
    });
    const order = ['general', 'company', 'contact', 'social', 'content', 'seo', 'media', 'mail', 'notifications', ''];
    return Object.keys(groups)
      .sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
      .map((g) => ({
        group: g,
        label: displayGroup(g || null),
        items: groups[g],
      }));
  }, [settings]);

  function markDirty(id: number) {
    setDirtyIds((prev) => {
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  }

  function setLocalValue<T>(id: number, value: T) {
    setLocalValues((prev) => ({ ...prev, [id]: value }));
    markDirty(id);
  }

  function handleChangeText(id: number, type: SettingType, value: string) {
    if (type === 'json') {
      setJsonErrors((prev) => ({
        ...prev,
        [id]: value && !isJsonStringValid(value) ? 'JSON invalide — syntaxe incorrecte.' : null,
      }));
    }
    if (type === 'integer') {
      const n = value === '' ? null : Number(value);
      setLocalValue(id, n == null || Number.isNaN(n) ? null : Math.trunc(n));
    } else if (type === 'decimal') {
      const n = value === '' ? null : Number(value);
      setLocalValue(id, n == null || Number.isNaN(n) ? null : n);
    } else if (type === 'json') {
      setLocalValue(id, value);
    } else {
      setLocalValue(id, value);
    }
  }

  function handleChangeBool(id: number, checked: boolean) {
    setLocalValue(id, checked);
  }

  async function handleImageUpload(id: number, file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Type de fichier invalide', { description: 'Veuillez sélectionner une image.' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image trop volumineuse', { description: 'Taille maximum autorisée : 8 Mo.' });
      return;
    }
    setSavingIds((prev) => new Set(prev).add(id));
    try {
      const form = new FormData();
      form.append('value', file);
      const updated = await api.upload<SettingRowWithGroup>(`/v1/settings/${id}`, form);
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, value: updated.value, value_url: updated.value_url, raw_value: updated.raw_value } : s))
      );
      setLocalValues((prev) => ({ ...prev, [id]: updated.value }));
      setDirtyIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      toast.success('Image enregistrée', { description: file.name });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Téléversement échoué', { description: msg });
    } finally {
      setSavingIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      if (fileInputRefs.current[id]) {
        fileInputRefs.current[id]!.value = '';
      }
    }
  }

  async function saveOne(id: number) {
    const setting = settings.find((s) => s.id === id);
    if (!setting) return;
    const value = localValues[id];
    if (setting.type === 'json' && typeof value === 'string' && value && !isJsonStringValid(value)) {
      toast.error('JSON invalide', { description: 'Corrigez la syntaxe avant d’enregistrer.' });
      return;
    }
    setSavingIds((prev) => new Set(prev).add(id));
    try {
      const payload =
        setting.type === 'boolean'
          ? { value: Boolean(value) }
          : setting.type === 'integer'
            ? { value: value === null || value === undefined || value === '' ? null : Math.trunc(Number(value)) }
            : setting.type === 'decimal'
              ? { value: value === null || value === undefined || value === '' ? null : Number(value) }
              : setting.type === 'json'
                ? { value: typeof value === 'string' ? value : JSON.stringify(value ?? null) }
                : { value: value === null || value === undefined ? '' : String(value) };
      const updated = await api.put<SettingRowWithGroup>(`/v1/settings/${id}`, payload);
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, value: updated.value, raw_value: updated.raw_value, value_url: updated.value_url } : s))
      );
      setLocalValues((prev) => ({ ...prev, [id]: updated.value }));
      setDirtyIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      toast.success('Paramètre enregistré', { description: setting.key });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      toast.error('Enregistrement échoué', { description: msg });
    } finally {
      setSavingIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  }

  function renderEditor(setting: SettingRowWithGroup) {
    const id = setting.id;
    const value = localValues[id];
    const isSaving = savingIds.has(id);
    const isDirty = dirtyIds.has(id);
    const jsonErr = jsonErrors[id];

    const commonCol = 'md:col-span-2';

    switch (setting.type) {
      case 'boolean':
        return (
          <div className={commonCol}>
            <div className="flex items-start justify-between gap-4">
              <CheckboxField
                name={`setting-${id}`}
                label={setting.label ?? setting.key}
                helpText={setting.description ?? undefined}
                checked={Boolean(value)}
                onChange={(checked: boolean) => handleChangeBool(id, checked)}
              />
              <Button
                variant={isDirty ? 'primary' : 'secondary'}
                size="sm"
                loading={isSaving}
                disabled={isSaving || !isDirty}
                onClick={() => void saveOne(id)}
                iconLeft={isSaving ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <SaveIcon className="h-4 w-4" aria-hidden />}
              >
                {isDirty ? 'Enregistrer' : 'Enregistré'}
              </Button>
            </div>
          </div>
        );

      case 'integer':
        return (
          <>
            <div>
              <TextField
                name={`setting-${id}`}
                label={setting.label ?? setting.key}
                helpText={setting.description ?? undefined}
                type="number"
                step={1}
                min={0}
                value={value === null || value === undefined ? '' : String(Number(value) || 0)}
                onChange={(v: string) => handleChangeText(id, 'integer', v)}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button
                variant={isDirty ? 'primary' : 'secondary'}
                size="sm"
                loading={isSaving}
                disabled={isSaving || !isDirty}
                onClick={() => void saveOne(id)}
                iconLeft={isSaving ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <SaveIcon className="h-4 w-4" aria-hidden />}
              >
                Enregistrer
              </Button>
            </div>
          </>
        );

      case 'decimal':
        return (
          <>
            <div>
              <TextField
                name={`setting-${id}`}
                label={setting.label ?? setting.key}
                helpText={setting.description ?? undefined}
                type="number"
                step="0.01"
                min={0}
                value={value === null || value === undefined ? '' : String(Number(value) || 0)}
                onChange={(v: string) => handleChangeText(id, 'decimal', v)}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button
                variant={isDirty ? 'primary' : 'secondary'}
                size="sm"
                loading={isSaving}
                disabled={isSaving || !isDirty}
                onClick={() => void saveOne(id)}
                iconLeft={isSaving ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <SaveIcon className="h-4 w-4" aria-hidden />}
              >
                Enregistrer
              </Button>
            </div>
          </>
        );

      case 'json':
        return (
          <div className={commonCol}>
            <TextAreaField
              name={`setting-${id}`}
              label={setting.label ?? setting.key}
              helpText={setting.description ?? formatJsonSyntaxHint()}
              rows={6}
              error={jsonErr ?? undefined}
              value={
                typeof value === 'string'
                  ? value
                  : value === null || value === undefined
                    ? ''
                    : JSON.stringify(value, null, 2)
              }
              onChange={(v: string) => handleChangeText(id, 'json', v)}
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              {isDirty && !jsonErr && (
                <span className="text-xs text-warning inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
                  Modifications non enregistrées
                </span>
              )}
              <Button
                variant={isDirty && !jsonErr ? 'primary' : 'secondary'}
                size="sm"
                loading={isSaving}
                disabled={isSaving || !isDirty || !!jsonErr}
                onClick={() => void saveOne(id)}
                iconLeft={isSaving ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <SaveIcon className="h-4 w-4" aria-hidden />}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className={commonCol}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface-alt">
                {setting.value_url ? (
                  <img
                    src={setting.value_url}
                    alt={setting.label ?? setting.key}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-black/40" aria-hidden />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-black/85">
                    {setting.label ?? setting.key}
                  </p>
                  {setting.description && (
                    <p className="text-xs text-black/50 mt-0.5">{setting.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`setting-file-${id}`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleImageUpload(id, f);
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<UploadIcon className="h-4 w-4" aria-hidden />}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`setting-file-${id}`)?.click();
                    }}
                  >
                    {setting.value_url ? 'Remplacer' : 'Téléverser'}
                  </Button>
                  {isSaving && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-info">
                      <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
                      Envoi…
                    </span>
                  )}
                  {setting.value_url && !isSaving && (
                    <span className="inline-flex items-center gap-1 text-xs text-success">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden />
                      Présente
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <>
            <div>
              <TextField
                name={`setting-${id}`}
                label={setting.label ?? setting.key}
                helpText={setting.description ?? undefined}
                value={value === null || value === undefined ? '' : String(value)}
                onChange={(v: string) => handleChangeText(id, 'text', v)}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button
                variant={isDirty ? 'primary' : 'secondary'}
                size="sm"
                loading={isSaving}
                disabled={isSaving || !isDirty}
                onClick={() => void saveOne(id)}
                iconLeft={isSaving ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <SaveIcon className="h-4 w-4" aria-hidden />}
              >
                Enregistrer
              </Button>
            </div>
          </>
        );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <AdminPageHeader
        title="Paramètres"
        description="Coordonnées, contenus éditables et configuration du site."
        actions={
          dirtyIds.size > 0 && (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<XIcon className="h-4 w-4" aria-hidden />}
              onClick={() => void fetchSettings()}
            >
              Annuler {dirtyIds.size} modif.
            </Button>
          )
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
              onClick={() => void fetchSettings()}
            >
              Réessayer
            </Button>
          </div>
        </AdminCard>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, gi) => (
            <AdminCard key={gi} className="p-5">
              <div className="h-5 w-1/3 animate-pulse rounded-md bg-line mb-5" aria-hidden />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                    <div className="space-y-2">
                      <div className="h-3.5 w-1/3 animate-pulse rounded bg-line" aria-hidden />
                      <div className="h-11 w-full animate-pulse rounded-md bg-line" aria-hidden />
                    </div>
                    <div className="h-9 w-28 animate-pulse rounded-md bg-line" aria-hidden />
                  </div>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.map(({ group, label, items }) => (
            <AdminCard
              key={group || 'default'}
              className={`p-5 ${['mail', 'notifications', 'media'].includes(group) ? 'lg:col-span-2' : ''}`}
            >
              <div className="mb-4 flex items-center gap-2 border-b border-line pb-3">
                <h2 className="text-lg font-semibold text-black/90">
                  {label}
                </h2>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold text-black/55">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-[1fr_auto] items-start">
                {items.map((setting) => (
                  <div key={setting.id} className="contents">
                    {renderEditor(setting)}
                  </div>
                ))}
              </div>
            </AdminCard>
          ))}

          {settings.length === 0 && (
            <AdminCard className="lg:col-span-2 p-10">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-black/55">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
                    <path
                      d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-black/90">
                  Aucun paramètre
                </h3>
                <p className="mt-1 text-sm text-black/60">
                  La liste des paramètres est vide. Les paramètres système apparaîtront ici lorsqu’ils seront disponibles.
                </p>
              </div>
            </AdminCard>
          )}
        </div>
      )}
    </motion.div>
  );
}
