<?php

namespace App\Modules\Management\Models;

use App\Modules\Administration\Models\User;
use App\Modules\ERP\Models\QuoteItem;
use App\Modules\Settings\Models\Category;
use App\Traits\CloudflareUpload;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use CloudflareUpload, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'reference',
        'name',
        'slug',
        'short_description',
        'description',
        'price',
        'stock',
        'low_stock_threshold',
        'is_quote_only',
        'unit',
        'is_featured',
        'is_available',
        'is_published',
        'published_at',
        'meta_title',
        'meta_description',
        'thumbnail',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'low_stock_threshold' => 'integer',
        'published_at' => 'datetime',
        'is_available' => 'boolean',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'is_quote_only' => 'boolean',
    ];

    protected $appends = [
        'thumbnail_url',
    ];

    /**
     * Get the thumbnail URL attribute.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->thumbnail) {
            return $this->getImageUrl($this->thumbnail, 'products');
        }

        // Return default thumbnail
        return null;
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id');
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class, 'product_id');
    }

    public function quoteItems()
    {
        return $this->hasMany(QuoteItem::class, 'product_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
