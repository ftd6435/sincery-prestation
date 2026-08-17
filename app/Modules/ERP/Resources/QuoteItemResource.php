<?php

namespace App\Modules\ERP\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name_snapshot,
            'product_unit' => $this->product_unit_snapshot,
            'quantity' => $this->quantity,
            'price' => $this->price_snapshot,
            'total_price' => $this->total_price,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
