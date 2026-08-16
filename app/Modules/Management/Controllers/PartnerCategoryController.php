<?php

namespace App\Modules\Management\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Management\Models\PartnerCategory;
use App\Modules\Management\Requests\PartnerCategoryRequest;
use App\Traits\ApiResponses;
use Illuminate\Support\Str;

class PartnerCategoryController extends Controller
{
    use ApiResponses;

    public function index()
    {
        $categories = PartnerCategory::with('partners')->get();

        return $this->successResponse($categories, "Catégories de partenaires chargées avec succès.");
    }

    public function show(PartnerCategory $category)
    {
        return $this->successResponse($category->load(['partners']), "Catégorie de partenaire chargée avec succès.");
    }

    public function store(PartnerCategoryRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->generateUniqueSlug($data['name']);

        $category = PartnerCategory::create($data);

        return $this->successResponse($category, "Catégorie de partenaire créée avec succès.");
    }

    public function update(PartnerCategoryRequest $request, PartnerCategory $category)
    {
        $data = $request->validated();
        $data['slug'] = $this->generateUniqueSlug($data['name'], $category->id);

        $category->update($data);

        return $this->successResponse($category, "Catégorie de partenaire mise à jour avec succès.");
    }

    public function destroy(PartnerCategory $category)
    {
        $category->delete();

        return $this->noContentSuccessResponse("Catégorie de partenaire supprimée avec succès.");
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while (
            PartnerCategory::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
