<?php

namespace App\Modules\Management\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerCategory extends Model
{
    protected $table = 'partner_categories';
    protected $fillable = ['name', 'slug', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function partners()
    {
        return $this->hasMany(Partner::class, 'category_id');
    }
}
