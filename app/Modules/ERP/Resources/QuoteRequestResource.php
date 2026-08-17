<?php

namespace App\Modules\ERP\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status,
            'prefered_contact' => $this->prefered_contact,
            'validity_date' => $this->validity_date,
            'comment' => $this->comment,
            'customer' => [
                'id' => $this->customer->id,
                'full_name' => $this->customer->full_name,
                'company_name' => $this->customer->company_name,
                'email' => $this->customer->email,
                'phone' => $this->customer->phone,
                'address' => $this->customer->address,
                'city' => $this->customer->city,
                'country' => $this->customer->country,
            ],
            'items' => QuoteItemResource::collection($this->whenLoaded('items')),
            'items_total' => $this->whenLoaded('items', fn() => $this->items->sum('total_price')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
