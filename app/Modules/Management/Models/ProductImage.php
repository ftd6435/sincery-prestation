<?php

namespace App\Modules\Management\Models;

use App\Traits\CloudflareUpload;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use CloudflareUpload;

    protected $table = 'product_images';

    protected $fillable = [
        'product_id',
        'image_path',
        'sort_order',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Get the image URL attribute.
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->image_path) {
            return $this->getImageUrl($this->image_path, 'products');
        }

        // Return default image
        return null;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
