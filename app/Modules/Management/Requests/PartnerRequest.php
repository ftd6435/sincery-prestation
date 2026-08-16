<?php

namespace App\Modules\Management\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class PartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:partner_categories,id',
            'name' => ['required', 'string', Rule::unique('partners', 'name')->ignore($this->partner)],
            'sector' => 'required|string',
            'email' => ['required', 'email', Rule::unique('partners', 'email')->ignore($this->partner)],
            'phone' => ['required', 'string', 'min:9', 'max:14', Rule::unique('partners', 'phone')->ignore($this->partner)],
            'address' => ['required', 'string'],
            'logo' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'website' => ['required', 'url'],
            'is_featured' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'description' => ['nullable', 'string'],
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'category_id.required' => 'Veuillez sélectionner une catégorie de partenaire.',
            'name.required' => 'Veuillez entrer un nom de partenaire.',
            'sector.required' => 'Veuillez entrer un secteur de partenaire.',
            'email.required' => 'Veuillez entrer un email de partenaire.',
            'phone.required' => 'Veuillez entrer un numéro de téléphone de partenaire.',
            'address.required' => 'Veuillez entrer une adresse de partenaire.',
            'logo.required' => 'Veuillez entrer une logo de partenaire.',
            'website.required' => 'Veuillez entrer un site web de partenaire.',
            'is_featured.required' => 'Veuillez sélectionner une valeur pour le champ est feature.',
            'is_active.required' => 'Veuillez sélectionner une valeur pour le champ est actif.',
            'description.required' => 'Veuillez entrer une description de partenaire.',
        ];
    }
}
