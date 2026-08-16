<?php

namespace App\Modules\Management\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,

            'category' => $this->whenLoaded('category'),

            'reference' => $this->reference,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => $this->price ?? null,
            'unit' => $this->unit,

            'is_quote_only' => $this->is_quote_only,
            'is_featured' => $this->is_featured,
            'is_available' => $this->is_available,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at->toDateTimeString() ?? null,

            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'thumbnail_url' => $this->thumbnail_url,
            'images' => $this->whenLoaded('images', fn() => $this->images->sortBy('sort_order')),
            'attributes' => $this->whenLoaded('attributes'),

            'created_by' => $this->createdBy->name ?? null,
            'updated_by' => $this->updatedBy->name ?? null,

            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
