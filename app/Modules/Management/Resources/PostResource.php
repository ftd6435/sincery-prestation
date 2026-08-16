<?php

namespace App\Modules\Management\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class PostResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,

            'category' => $this->whenLoaded('category'),
            'author' => $this->whenLoaded('author'),
            'images' => $this->whenLoaded('images'),
            'comments' => $this->whenLoaded('comments'),

            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'thumbnail_url' => $this->thumbnail_url,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at->toDateTimeString() ?? null,

            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,

            'created_by_name' => $this->createdBy->name ?? null,
            'updated_by_name' => $this->updatedBy->name ?? null,

            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'deleted_at' => $this->deleted_at->toDateTimeString() ?? null,
        ];
    }
}
