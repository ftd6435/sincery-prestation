<?php

namespace App\Modules\Management\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Management\Models\Product;
use App\Modules\Management\Models\ProductImage;
use App\Modules\Management\Models\ProductAttribute;
use App\Modules\Management\Requests\ProductRequest;
use App\Modules\Management\Resources\ProductResource;
use App\Traits\ApiResponses;
use App\Traits\CloudflareUpload;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponses, CloudflareUpload;

    public function index()
    {
        $products = Product::with(['category', 'createdBy', 'updatedBy', 'images', 'attributes'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(ProductResource::collection($products), "Produits chargés avec succès");
    }

    public function show(Product $product)
    {
        return $this->successResponse(
            new ProductResource($product->load(['category', 'createdBy', 'updatedBy', 'images', 'attributes'])),
            "Produit chargé avec succès"
        );
    }

    public function store(ProductRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        $data['reference'] = $data['reference'] ?? $this->generateReference($data['name']);
        $data['slug'] = $data['slug'] ?? $this->generateUniqueSlug($data['name']);
        $data['is_published'] = $data['is_published'] ?? false;

        if ($data['is_published']) {
            $data['published_at'] = now();
        }

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $this->uploadImage($request->file('thumbnail'), 'products');
        }

        $images = $data['images'] ?? [];
        $attributes = $data['attributes'] ?? [];
        unset($data['images'], $data['attributes']);

        $product = DB::transaction(function () use ($data, $images, $attributes, $request) {
            $product = Product::create($data);

            foreach ($images as $index => $image) {
                $path = $this->uploadImage($request->file("images.{$index}.image_path"), 'products');
                $product->images()->create([
                    'image_path' => $path,
                    'sort_order' => $index,
                ]);
            }

            foreach ($attributes as $attribute) {
                $product->attributes()->create([
                    'name' => $attribute['name'],
                    'value' => $attribute['value'],
                ]);
            }

            return $product;
        });

        return $this->successResponse(
            new ProductResource($product->load(['category', 'createdBy', 'updatedBy', 'images', 'attributes'])),
            "Produit créé avec succès"
        );
    }

    public function update(ProductRequest $request, Product $product)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        if (array_key_exists('is_published', $data)) {
            if ($data['is_published'] && !$product->is_published) {
                // Newly published: stamp it
                $data['published_at'] = now();
            } elseif (!$data['is_published']) {
                // Explicitly unpublished
                $data['published_at'] = null;
            }
        }

        if ($request->hasFile('thumbnail')) {
            $this->deleteImage($product->thumbnail, 'products');
            $data['thumbnail'] = $this->uploadImage($request->file('thumbnail'), 'products');
        }

        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);
        }

        $images = $data['images'] ?? null;
        $attributes = $data['attributes'] ?? null;
        unset($data['images'], $data['attributes']);

        DB::transaction(function () use ($product, $data, $images, $attributes, $request) {
            $product->update($data);

            // Full replace: only touches images/attributes if the key was sent
            if ($images !== null) {
                foreach ($product->images as $existing) {
                    $this->deleteImage($existing->image_path, 'products');
                }
                $product->images()->delete();

                foreach ($images as $index => $image) {
                    $path = $this->uploadImage($request->file("images.{$index}.image_path"), 'products');
                    $product->images()->create([
                        'image_path' => $path,
                        'sort_order' => $index,
                    ]);
                }
            }

            if ($attributes !== null) {
                $product->attributes()->delete();

                foreach ($attributes as $attribute) {
                    $product->attributes()->create([
                        'name' => $attribute['name'],
                        'value' => $attribute['value'],
                    ]);
                }
            }
        });

        return $this->successResponse(
            new ProductResource($product->load(['category', 'createdBy', 'updatedBy', 'images', 'attributes'])),
            "Produit mis à jour avec succès"
        );
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return $this->successResponse(null, "Produit supprimé avec succès");
    }

    public function restore(Product $product)
    {
        $product->restore();

        return $this->successResponse(new ProductResource($product), "Produit restauré avec succès");
    }

    public function forceDelete(Product $product)
    {
        DB::transaction(function () use ($product) {
            $this->deleteImage($product->thumbnail, 'products');

            foreach ($product->images as $image) {
                $this->deleteImage($image->image_path, 'products');
            }

            $product->images()->delete();
            $product->attributes()->delete();
            $product->forceDelete();
        });

        return $this->successResponse(null, "Produit supprimé définitivement avec succès");
    }

    public function trashed()
    {
        $products = Product::onlyTrashed()
            ->with(['category', 'createdBy', 'updatedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(ProductResource::collection($products), "Produits supprimés chargés avec succès");
    }

    private function generateReference(string $name)
    {
        $count = Product::withTrashed()->count();

        $reference = 'PRD-' . strtoupper(substr($name, 0, 3)) . '-' . sprintf('%03d', $count + 1);

        return $reference;
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while (
            Product::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
