<?php

namespace App\Modules\ERP\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class QuoteRequestPricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Route parameter name must match your route definition, e.g. {quoteRequest}
        $quoteRequest = $this->route('quoteRequest');
        $itemIds = $quoteRequest ? $quoteRequest->items()->pluck('id')->toArray() : [];

        return [
            'validity_date' => ['required', 'date', 'after_or_equal:today'],
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'distinct', Rule::in($itemIds)],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'validity_date.required' => 'La date de validité est requise',
            'validity_date.after_or_equal' => 'La date de validité doit être aujourd\'hui ou plus tard',
            'items.required' => 'Les articles sont requis',
            'items.*.id.in' => 'Cet article n\'appartient pas à cette demande de devis',
            'items.*.id.distinct' => 'Un article est dupliqué dans la liste',
            'items.*.price.required' => 'Le prix est requis pour chaque article',
            'items.*.price.min' => 'Le prix doit être positif',
            'items.*.quantity.required' => 'La quantité est requise pour chaque article',
            'items.*.quantity.min' => 'La quantité doit être positif',
        ];
    }
}
