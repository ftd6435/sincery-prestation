<?php

namespace App\Modules\Settings\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Models\Category;
use App\Modules\Settings\Requests\CategoryRequest;
use App\Modules\Settings\Resources\CategoryResource;
use App\Traits\ApiResponses;
use App\Traits\CloudflareUpload;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponses, CloudflareUpload;

    public function index()
    {
        $categories = Category::with('children', 'createdBy', 'updatedBy')->orderBy('sort_order')->get();

        return $this->successResponse(CategoryResource::collection($categories), "Catégories chargées avec succès.");
    }

    public function trashed()
    {
        $categories = Category::onlyTrashed()->get();

        return $this->successResponse(CategoryResource::collection($categories), "Catégories de la corbeille chargées avec succès.");
    }

    public function show(Category $category)
    {
        return $this->successResponse(
            new CategoryResource($category->load(['children', 'createdBy', 'updatedBy'])),
            "Catégorie chargée avec succès."
        );
    }

    public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        $data['slug'] = $this->generateUniqueSlug($data['name']);
        $data['sort_order'] = $data['sort_order'] ?? Category::query()->max('sort_order') + 1;

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage($request->file('image'), 'categories');
        }

        $category = Category::create($data);

        return $this->successResponse(
            new CategoryResource($category->load(['children', 'createdBy', 'updatedBy'])),
            "Catégorie créée avec succès."
        );
    }

    public function update(CategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $category->id);
        }

        if ($request->hasFile('image')) {
            $this->deleteImage($category->image, 'categories');
            $data['image'] = $this->uploadImage($request->file('image'), 'categories');
        }

        $category->update($data);

        return $this->successResponse(
            new CategoryResource($category->load(['children', 'createdBy', 'updatedBy'])),
            "Catégorie mise à jour avec succès."
        );
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return $this->noContentSuccessResponse("Catégorie supprimée avec succès.");
    }

    public function restore(Category $category)
    {
        $category->restore();

        return $this->successResponse(new CategoryResource($category), "Catégorie restaurée avec succès.");
    }

    public function forceDelete(Category $category)
    {
        $this->deleteImage($category->image, 'categories');
        $category->forceDelete();

        return $this->noContentSuccessResponse("Catégorie supprimée permanentement avec succès.");
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while (
            Category::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
