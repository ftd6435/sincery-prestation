<?php

namespace App\Modules\Management\Models;

use App\Traits\CloudflareUpload;
use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    use CloudflareUpload;

    protected $table = 'post_images';
    protected $fillable = [
        'post_id',
        'image',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Get the image URL attribute.
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->image) {
            return $this->getImageUrl($this->image, 'posts');
        }

        // Return default image URL
        return null;
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}
