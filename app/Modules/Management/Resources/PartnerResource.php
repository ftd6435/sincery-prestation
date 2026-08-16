<?php

namespace App\Modules\Management\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,

            'category' => $this->whenLoaded('category'),

            'name' => $this->name,
            'slug' => $this->slug,
            'sector' => $this->sector,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'logo_url' => $this->logo_url,
            'website' => $this->website,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,

            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
