<?php

namespace App\Modules\Settings\Resources;

use App\Modules\Administration\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'parent_id' => $this->parent_id,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'parent' => $this->whenLoaded('parent', fn() => $this->parent ? new self($this->parent) : null),
            'children' => $this->whenLoaded('children', fn() => self::collection($this->children)),
            'products_count' => $this->when($this->relationLoaded('products'), fn() => $this->products->count()),
            'created_by_name' => $this->whenLoaded('createdBy', function () {
                return $this->createdBy?->name ?? null;
            }),
            'updated_by_name' => $this->whenLoaded('updatedBy', function () {
                return $this->updatedBy?->name ?? null;
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'deleted_at' => $this->deleted_at?->toDateTimeString(),
        ];
    }
}
