<?php

namespace App\Modules\ERP\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model
{
    protected $table = 'quote_requests';
    protected $fillable = [
        'customer_id',
        'reference',
        'status',
        'prefered_contact',
        'validity_date',
        'comment',
    ];

    protected $casts = [
        'validity_date' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function quoteItems()
    {
        return $this->hasMany(QuoteItem::class, 'quote_request_id');
    }

    /**
     * Alias de la relation quoteItems() — utilisé par les contrôleurs/ressources
     * (historique du code : la relation s'appelait à l'origine "items").
     */
    public function items()
    {
        return $this->hasMany(QuoteItem::class, 'quote_request_id');
    }
}
