<?php

namespace App\Modules\ERP\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class OrderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_mode' => ['sometimes', 'required', Rule::in(OrderRequest::DELIVERY_MODES)],
            'status' => ['sometimes', 'required', Rule::in(OrderRequest::STATUSES)],
            'comment' => ['sometimes', 'nullable', 'string'],
            'internal_notes' => ['sometimes', 'nullable', 'string'],

            // Admin can also resync items (optional)
            'items' => ['sometimes', 'required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'integer', 'exists:order_items,id'],
            'items.*.product_id' => ['required_without:items.*.id', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'delivery_mode.in' => 'Le mode de livraison doit être « Livraison » ou « Retrait boutique »',
            'status.in' => 'Statut invalide (new, pending, confirmed, delivered, canceled)',
            'items.min' => 'Au moins un article est requis',
        ];
    }
}
