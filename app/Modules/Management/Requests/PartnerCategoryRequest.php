<?php

namespace App\Modules\Management\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PartnerCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'is_active' => 'required|boolean',
        ];
    }
}
