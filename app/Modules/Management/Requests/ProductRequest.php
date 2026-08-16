<?php

namespace App\Modules\Management\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:categories,id',
            'reference' => ['nullable', 'string', Rule::unique('products', 'reference')->ignore($this->product)],
            'name' => 'required|string',
            'short_description' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'nullable|decimal:2', // Price must be provided if is_quote_only is false
            'is_quote_only' => 'nullable|boolean', // Price must be provided if is_quote_only is false
            'unit' => 'required|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',

            'images' => 'nullable|array',
            'images.*.image_path' => 'required|image|mimes:png,jpg,jpeg|max:2048',

            'attributes' => 'nullable|array',
            'attributes.*.name' => 'required|string',
            'attributes.*.value' => 'required|string',
        ];
    }
}
