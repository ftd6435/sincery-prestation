<?php

namespace App\Modules\ERP\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $table = 'customers';
    protected $fillable = [
        'full_name',
        'company_name',
        'email',
        'phone',
        'address',
        'city',
        'country',
    ];

    public function quoteRequests()
    {
        return $this->hasMany(QuoteRequest::class, 'customer_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }
}
