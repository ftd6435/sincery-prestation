import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { AdminCard } from '../../admin/AdminPageHeader';
import { Button } from '../../ui/Button';
import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
} from '../Field';

export interface PostCategoryOption {
  id: number | string;
  name: string;
}

export interface PostAuthorOption {
  id: number | string;
  name: string;
}

export interface PostFormValues {
  post_category_id: number;
  author_id: number;
  title: string;
  excerpt: string;
  content: string;
  description: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
  thumbnail: File | null;
  thumbnail_preview?: string | null;
}

export type PartialPostFormValues = Partial<PostFormValues>;

const postSchema = z.object({
  post_category_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(1, 'La catégorie d\'article est requise'),
  ),
  author_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(1, 'L\'auteur est requis'),
  ),
  title: z
    .string({ required_error: 'Le titre est requis' })
    .min(1, 'Le titre est requis'),
  excerpt: z
    .string({ required_error: 'L\'extrait est requis' })
    .min(1, 'L\'extrait est requis')
    .max(255, 'L\'extrait ne peut contenir au maximum 255 caractères'),
  content: z
    .string({ required_error: 'Le contenu est requis' })
    .min(1, 'Le contenu est requis'),
  description: z
    .string({ required_error: 'La description est requise' })
    .min(1, 'La description est requise'),
  meta_title: z
    .string({ required_error: 'Le méta-titre est requis' })
    .min(1, 'Le méta-titre est requis')
    .max(255, 'Le méta-titre ne peut contenir au maximum 255 caractères'),
  meta_description: z
    .string({ required_error: 'La méta-description est requise' })
    .min(1, 'La méta-description est requise'),
  published: z.boolean(),
  thumbnail: z.instanceof(File).nullable().optional(),
});

const defaultValues: PostFormValues = {
  post_category_id: 0,
  author_id: 0,
  title: '',
  excerpt: '',
  content: '',
  description: '',
  meta_title: '',
  meta_description: '',
  published: true,
  thumbnail: null,
  thumbnail_preview: null,
};

export interface PostFormProps {
  initialValues?: PartialPostFormValues;
  postCategories: PostCategoryOption[];
  authors: PostAuthorOption[];
  onSubmit: (values: PostFormValues) => void;
  submitting?: boolean;
}

export function PostForm({
  initialValues,
  postCategories,
  authors,
  onSubmit,
  submitting = false,
}: PostFormProps) {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as never,
    defaultValues,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialValues?.thumbnail_preview ?? null,
  );

  useEffect(() => {
    const merged: PostFormValues = {
      ...defaultValues,
      ...initialValues,
    };
    form.reset(merged);
    setThumbnailPreview(initialValues?.thumbnail_preview ?? null);
  }, [initialValues, form]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(initialValues?.thumbnail_preview ?? null);
    }
    form.setValue('thumbnail', file, { shouldValidate: true });
  };

  const clearThumbnail = () => {
    form.setValue('thumbnail', null, { shouldValidate: true });
    setThumbnailPreview(initialValues?.thumbnail_preview ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as PostFormValues);
  });

  const categoryOptions = postCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const authorOptions = authors.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  return (
    <AdminCard className="p-5">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Catégorie d'article"
            name="post_category_id"
            required
            emptyLabel="Sélectionner une catégorie"
            options={categoryOptions}
            value={form.watch('post_category_id') === 0 ? '' : form.watch('post_category_id') ?? ''}
            onChange={(v: string) =>
              form.setValue('post_category_id', v === '' ? 0 : Number(v), {
                shouldValidate: true,
              })
            }
            error={form.formState.errors.post_category_id?.message as string ?? undefined}
          />

          <SelectField
            label="Auteur"
            name="author_id"
            required
            emptyLabel="Sélectionner un auteur"
            options={authorOptions}
            value={form.watch('author_id') === 0 ? '' : form.watch('author_id') ?? ''}
            onChange={(v: string) =>
              form.setValue('author_id', v === '' ? 0 : Number(v), {
                shouldValidate: true,
              })
            }
            error={form.formState.errors.author_id?.message as string ?? undefined}
          />

          <TextField
            label="Titre"
            name="title"
            required
            className="sm:col-span-2"
            placeholder="Titre de l'article"
            value={form.watch('title')}
            onChange={(v: string) => form.setValue('title', v, { shouldValidate: true })}
            error={form.formState.errors.title?.message as string ?? undefined}
          />

          <TextAreaField
            label="Extrait"
            name="excerpt"
            rows={3}
            maxLength={255}
            required
            className="sm:col-span-2"
            placeholder="Extrait court de l'article (max. 255 caractères)"
            value={form.watch('excerpt')}
            onChange={(v: string) => form.setValue('excerpt', v, { shouldValidate: true })}
            error={form.formState.errors.excerpt?.message as string ?? undefined}
          />

          <TextAreaField
            label="Contenu"
            name="content"
            rows={10}
            required
            className="sm:col-span-2"
            placeholder="Contenu complet de l'article"
            value={form.watch('content')}
            onChange={(v: string) => form.setValue('content', v, { shouldValidate: true })}
            error={form.formState.errors.content?.message as string ?? undefined}
          />

          <TextAreaField
            label="Description"
            name="description"
            rows={3}
            required
            className="sm:col-span-2"
            placeholder="Description de l'article"
            value={form.watch('description')}
            onChange={(v: string) => form.setValue('description', v, { shouldValidate: true })}
            error={form.formState.errors.description?.message as string ?? undefined}
          />

          <div className="sm:col-span-2">
            <CheckboxField
              label="Publié"
              name="published"
              checked={form.watch('published')}
              onChange={(v: boolean) =>
                form.setValue('published', v, { shouldValidate: true })
              }
              error={form.formState.errors.published?.message as string ?? undefined}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="post-thumbnail-input"
              className="mb-1.5 block text-sm text-black/65"
            >
              Vignette
            </label>
            <div
              className="h-40 w-full rounded-md border-2 border-dashed border-line flex items-center justify-center text-sm text-black/50 overflow-hidden relative bg-surface-alt/20"
              onClick={() => fileInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Aperçu"
                    className="h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearThumbnail();
                    }}
                    className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
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
              id="post-thumbnail-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>

          <div className="sm:col-span-2 mt-6 pt-5 border-t border-line">
            <h3 className="text-lg font-semibold text-black/90 mb-4">
              Référencement SEO
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Méta-titre"
                name="meta_title"
                required
                maxLength={255}
                placeholder="Titre SEO"
                value={form.watch('meta_title')}
                onChange={(v: string) =>
                  form.setValue('meta_title', v, { shouldValidate: true })
                }
                error={form.formState.errors.meta_title?.message as string ?? undefined}
              />
              <TextAreaField
                label="Méta-description"
                name="meta_description"
                rows={3}
                required
                className="sm:col-span-2"
                placeholder="Description pour les moteurs de recherche"
                value={form.watch('meta_description')}
                onChange={(v: string) =>
                  form.setValue('meta_description', v, {
                    shouldValidate: true,
                  })
                }
                error={form.formState.errors.meta_description?.message as string ?? undefined}
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </div>
      </form>
    </AdminCard>
  );
}
