<?php

namespace App\Modules\Management\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Override;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'email' => 'required|string|email',
            'phone' => 'required|string|min:9|max:14',
            'subject' => 'required|string',
            'message' => 'required|string',
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'name.required' => "Le nom complet est requis",
            'email.required' => "L'adresse email est requise",
            'email.email' => "L'adresse email est invalide",
            'phone.required' => "Le numéro de téléphone est requis",
            'phone.min' => "Le numéro de téléphone doit être de 9 à 14 caractères",
            'phone.max' => "Le numéro de téléphone doit être de 9 à 14 caractères",
            'subject.required' => "Le sujet est requis",
            'subject.string' => "Le sujet doit être une chaine de caractères",
            'message.required' => "Le message est requis",
            'message.string' => "Le message doit être une chaine de caractères",
        ];
    }
}
