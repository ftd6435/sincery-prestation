<?php

namespace App\Modules\Management\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Management\Models\Partner;
use App\Modules\Management\Requests\PartnerRequest;
use App\Modules\Management\Resources\PartnerResource;
use App\Traits\ApiResponses;
use App\Traits\CloudflareUpload;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PartnerController extends Controller
{
    use ApiResponses, CloudflareUpload;

    public function index()
    {
        $partners = Partner::with(['category', 'createdBy', 'updatedBy'])->get();

        return $this->successResponse(PartnerResource::collection($partners), "Partenaire chargés avec succès.");
    }

    public function show(Partner $partner)
    {
        return $this->successResponse(new PartnerResource($partner->load(['category', 'createdBy', 'updatedBy'])), "Partenaire chargé avec succès.");
    }

    public function store(PartnerRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        $data['slug'] = $this->generateUniqueSlug($data['name']);

        if ($request->hasFile('logo')) {
            $data['logo'] = $this->uploadImage($request->file('logo'), 'partners');
        }

        $partner = Partner::create($data);

        return $this->successResponse(new PartnerResource($partner), "Partenaire créé avec succès.");
    }

    public function update(PartnerRequest $request, Partner $partner)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();
        $data['slug'] = $this->generateUniqueSlug($data['name'], $partner->id);

        if ($request->hasFile('logo')) {
            $this->deleteImage($partner->logo, 'partners');
            $data['logo'] = $this->uploadImage($request->file('logo'), 'partners');
        }

        $partner->update($data);

        return $this->successResponse(new PartnerResource($partner), "Partenaire mis à jour avec succès.");
    }

    public function destroy(Partner $partner)
    {
        $partner->delete();

        return $this->noContentSuccessResponse("Partenaire supprimé avec succès.");
    }

    public function restore(Partner $partner)
    {
        $partner->restore();

        return $this->noContentSuccessResponse("Partenaire restauré avec succès.");
    }

    public function forceDelete(Partner $partner)
    {
        $this->deleteImage($partner->logo, 'partners');
        $partner->forceDelete();

        return $this->noContentSuccessResponse("Partenaire force supprimé avec succès.");
    }

    public function trashed()
    {
        $partners = Partner::onlyTrashed()->get();

        return $this->successResponse(PartnerResource::collection($partners), "Partenaire supprimés avec succès.");
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while (
            Partner::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
