<?php

namespace App\Modules\Management\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Management\Models\PostImage;
use App\Traits\ApiResponses;
use App\Traits\CloudflareUpload;
use Illuminate\Http\Request;

class PostImageController extends Controller
{
    use ApiResponses, CloudflareUpload;

    public function store(Request $request)
    {
        // CKEditor (SimpleUploadAdapter) envoie le fichier dans le champ "upload"
        $request->validate([
            'upload' => ['required', 'image', 'mimes:png,jpg,jpeg,webp,gif', 'max:2048'],
        ]);

        $imageName = $this->uploadImage($request->file('upload'), 'posts');

        $image = PostImage::create(['image' => $imageName]);

        $data = [
            'id' => $image->id,
            'image' => $this->getImageUrl($image->image, 'posts'),
        ];

        return $this->successResponse($data, "Image uploadée avec succès");
    }

    public function show(string $image)
    {
        $image = PostImage::find($image);

        if (! $image) {
            return $this->errorResponse("Image introuvable");
        }

        $data = [
            'id' => $image->id,
            'image' => $this->getImageUrl($image->image, 'posts'),
        ];

        return $this->successResponse($data, "Image chargée avec succès.");
    }

    public function destroy(string $image)
    {
        $image = PostImage::find($image);

        if (! $image) {
            return $this->errorResponse("Image introuvable");
        }

        $image->delete();

        return $this->noContentSuccessResponse("Image supprimée avec succès.");
    }
}
