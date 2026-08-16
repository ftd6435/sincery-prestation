<?php

namespace App\Modules\Management\Models;

use App\Modules\Administration\Models\User;
use App\Traits\CloudflareUpload;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Partner extends Model
{
    use CloudflareUpload, SoftDeletes;

    protected $table = 'partners';

    protected $fillable = ['category_id', 'name', 'slug', 'sector', 'description', 'email', 'phone', 'address', 'logo', 'website', 'is_featured', 'is_active', 'created_by', 'updated_by'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected $appends = [
        'logo_url',
    ];

    /**
     * Get the logo URL attribute.
     */
    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo) {
            return $this->getImageUrl($this->logo, 'partners');
        }

        // Return default logo URL
        return null;
    }

    public function category()
    {
        return $this->belongsTo(PartnerCategory::class, 'category_id');
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
