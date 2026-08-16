<?php

namespace App\Modules\Settings\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => [
                'required',
                'string',
                'max:255',
                Rule::unique('settings', 'key')->ignore($this->route('setting')),
            ],
            'type' => [
                'required',
                'string',
                Rule::in(['text', 'boolean', 'json', 'image', 'integer', 'decimal']),
            ],
            'value' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    $type = $this->input('type', 'text');
                    switch ($type) {
                        case 'boolean':
                            if ($value !== null && !is_bool($value) && !in_array($value, ['1', '0', 1, 0, 'true', 'false', true, false], true)) {
                                $fail('La valeur du paramètre de type "boolean" doit être un booléen valide.');
                            }
                            break;
                        case 'json':
                            if (is_string($value) && $value !== '') {
                                json_decode($value, true);
                                if (json_last_error() !== JSON_ERROR_NONE) {
                                    $fail('La valeur du paramètre de type "json" doit être une chaîne JSON valide.');
                                }
                            } elseif (is_array($value)) {
                                // Accept arrays — will be encoded on save
                            } elseif ($value !== null && $value !== '') {
                                $fail('La valeur du paramètre de type "json" doit être un tableau ou une chaîne JSON.');
                            }
                            break;
                        case 'integer':
                            if ($value !== null && $value !== '' && filter_var($value, FILTER_VALIDATE_INT) === false) {
                                $fail('La valeur du paramètre de type "integer" doit être un entier.');
                            }
                            break;
                        case 'decimal':
                            if ($value !== null && $value !== '' && !is_numeric($value)) {
                                $fail('La valeur du paramètre de type "decimal" doit être un nombre.');
                            }
                            break;
                        case 'image':
                            if (!is_null($value) && !is_string($value) && !$this->hasFile('value')) {
                                $fail('La valeur du paramètre de type "image" doit être un fichier image ou une URL de fichier existant.');
                            }
                            break;
                        case 'text':
                        default:
                            if ($value !== null && !is_string($value) && !is_numeric($value)) {
                                $fail('La valeur du paramètre de type "text" doit être une chaîne de caractères.');
                            }
                            break;
                    }
                },
            ],
            'value_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,svg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'key.required' => 'La clé du paramètre est obligatoire.',
            'key.unique' => 'Cette clé de paramètre existe déjà.',
            'type.required' => 'Le type du paramètre est obligatoire.',
            'type.in' => 'Le type du paramètre doit être l\'un des suivants : text, boolean, json, image, integer, decimal.',
        ];
    }
}
