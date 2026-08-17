<?php

namespace App\Modules\ERP\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';

    protected $fillable = [
        'reference',
        'customer_id',
        'status',
        'delivery_mode',
        'comment',
        'internal_notes',
    ];

    protected $casts = [
        'status' => 'string',
        'delivery_mode' => 'string',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * Alias — controllers/resources call items() (consistency with quote_requests).
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}
