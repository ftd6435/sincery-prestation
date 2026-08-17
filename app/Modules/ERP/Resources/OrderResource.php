<?php

namespace App\Modules\ERP\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status,
            'status_label' => $this->statusLabel(),
            'delivery_mode' => $this->delivery_mode,
            'comment' => $this->comment,
            'internal_notes' => $request->user() ? $this->internal_notes : null,
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
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'items_count' => $this->whenLoaded('items', fn() => $this->items->count()),
            'items_total' => $this->whenLoaded('items', fn() => (float) $this->items->sum('total_price')),
            'can_confirm' => in_array($this->status, ['new', 'pending'], true),
            'can_cancel' => in_array($this->status, ['new', 'pending', 'confirmed'], true),
            'can_deliver' => $this->status === 'confirmed',
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }

    private function statusLabel(): string
    {
        return match ($this->status) {
            'new' => 'Nouvelle commande',
            'pending' => 'En cours de traitement',
            'confirmed' => 'Confirmée',
            'delivered' => 'Livrée / Retirée',
            'canceled' => 'Annulée',
            default => (string) $this->status,
        };
    }
}
