<?php

namespace App\Modules\ERP\Models;

use App\Modules\Management\Models\Product;
use Illuminate\Database\Eloquent\Model;

class QuoteItem extends Model
{
    protected $table = 'quote_items';
    protected $fillable = [
        'quote_request_id',
        'product_id',
        'product_name_snapshot',
        'product_unit_snapshot',
        'quantity',
        'price_snapshot',
        'total_price',
    ];

    protected $casts = [
        'price_snapshot' => 'decimal:2',
        'total_price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function quoteRequest()
    {
        return $this->belongsTo(QuoteRequest::class, 'quote_request_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
