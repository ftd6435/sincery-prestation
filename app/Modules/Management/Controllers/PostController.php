<?php

namespace App\Modules\Management\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Management\Models\Post;
use App\Modules\Management\Models\PostImage;
use App\Modules\Management\Requests\PostRequest;
use App\Modules\Management\Resources\PostResource;
use App\Traits\ApiResponses;
use App\Traits\CloudflareUpload;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Stevebauman\Purify\Facades\Purify;
use Illuminate\Support\Str;

class PostController extends Controller
{
    use ApiResponses, CloudflareUpload;

    public function index()
    {
        $posts = Post::with(['category', 'author', 'images', 'comments', 'createdBy', 'updatedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(PostResource::collection($posts), "Liste des articles chargée avec succès.");
    }

    public function store(PostRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        $data['slug'] = $this->generateUniqueSlug($data['title']);

        if ($data['is_published']) {
            $data['published_at'] = now();
        }

        // Nettoyage anti-XSS du HTML produit par CKEditor (liste blanche dans config/purify.php)
        $data['description'] = Purify::clean($data['description']);

        // Upload de l'image de couverture sur Cloudflare R2 si fournie
        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $this->uploadImage($request->file('thumbnail'), 'posts');
        }

        $post = Post::create($data);

        // Rattache à l'article les images de contenu uploadées par CKEditor pendant la rédaction
        $this->syncContentImages($post);

        logActivity("Création d'un article", $data, $post);

        return $this->successResponse(new PostResource($post->load('category', 'author', 'images', 'createdBy')), "Article créé avec succès.");
    }

    public function show(string $id)
    {
        $post = Post::with(['category', 'author', 'images', 'comments', 'createdBy', 'updatedBy'])->find($id);

        if (! $post) {
            return $this->errorResponse("Article introuvable");
        }

        return $this->successResponse(new PostResource($post), "Article chargé avec succès.");
    }

    // Route admin — modification d'un article existant
    public function update(PostRequest $request, Post $post)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        // Nettoyage anti-XSS du HTML produit par CKEditor (liste blanche dans config/purify.php)
        if (isset($data['description'])) {
            $data['description'] = Purify::clean($data['description']);
        }

        if (array_key_exists('is_published', $data)) {
            if ($data['is_published'] && !$post->is_published) {
                // Newly published: stamp it
                $data['published_at'] = now();
            } elseif (!$data['is_published']) {
                // Explicitly unpublished
                $data['published_at'] = null;
            }
        }

        if (isset($data['title']) && $data['title'] !== $post->title) {
            $data['slug'] = $this->generateUniqueSlug($data['title'], $post->id);
        }

        if ($request->hasFile('thumbnail')) {
            $this->deleteImage($post->thumbnail, 'posts');

            $data['thumbnail'] = $this->uploadImage($request->file('thumbnail'), 'posts');
        }

        // Capture l'état avant modification pour conserver un historique fidèle dans les logs
        $logData = [
            'old_value' => $post->toArray(),
            'new_value' => $data,
        ];

        $post->update($data);

        // Rattache les nouvelles images de contenu et supprime celles retirées du texte
        $this->syncContentImages($post);

        logActivity("Modification d'un article", $logData, $post);

        return $this->successResponse(new PostResource($post->load('category', 'author', 'images', 'createdBy', 'updatedBy')), "Article modifié avec succès.");
    }

    public function restore(Post $post)
    {
        $post->restore();

        return $this->successResponse(new PostResource($post), "Article restauré avec succès");
    }

    public function forceDelete(Post $post)
    {
        DB::transaction(function () use ($post) {
            $this->deleteImage($post->thumbnail, 'posts');

            foreach ($post->images as $image) {
                $this->deleteImage($image->image, 'posts');
            }

            $post->images()->delete();
            $post->forceDelete();
        });

        return $this->noContentSuccessResponse("Article supprimé définitivement avec succès");
    }

    public function trashed()
    {
        $posts = Post::onlyTrashed()
            ->with(['category', 'createdBy', 'updatedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(PostResource::collection($posts), "Articles supprimés chargés avec succès");
    }

    // Route admin — suppression définitive d'un article et de son image associée
    public function destroy(string $id)
    {
        $post = Post::find($id);

        if (! $post) {
            return $this->errorResponse("Article introuvable");
        }

        // Suppression du fichier image sur R2 pour ne pas laisser de fichiers orphelins
        if ($post->thumbnail) {
            $this->deleteImage($post->thumbnail, 'posts');
        }

        // Suppression des images de contenu (description) sur R2 et dans le registre
        foreach ($post->images as $image) {
            $this->deleteImage($image->image, 'posts');
        }
        $post->images()->delete();

        logActivity("Suppression d'un article", $post->toArray(), $post);
        $post->delete();

        return $this->noContentSuccessResponse("Article supprimé avec succès");
    }

    // Synchronise le registre post_images avec les images réellement présentes
    // dans le HTML de la description
    private function syncContentImages(Post $post): void
    {
        $referenced = $this->extractContentImageNames($post->description);

        // Supprime de R2 et du registre les images de l'article qui ne sont plus dans le texte
        foreach ($post->images()->whereNotIn('image', $referenced)->get() as $image) {
            $this->deleteImage($image->image, 'posts');
            $image->delete();
        }

        // Rattache les images fraîchement uploadées par CKEditor (post_id encore NULL)
        if ($referenced) {
            PostImage::whereNull('post_id')
                ->whereIn('image', $referenced)
                ->update(['post_id' => $post->id]);
        }
    }

    // Extrait les noms de fichiers des balises <img src=".../post-images/xxx.ext"> du HTML
    private function extractContentImageNames(?string $html): array
    {
        if (! $html) {
            return [];
        }

        preg_match_all('#/post-images/([A-Za-z0-9\-]+\.[A-Za-z0-9]+)#', $html, $matches);

        return array_values(array_unique($matches[1]));
    }

    private function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $i = 1;

        while (
            Post::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
