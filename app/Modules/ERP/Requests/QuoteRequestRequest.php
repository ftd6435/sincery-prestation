<?php

namespace App\Modules\ERP\Requests;

use App\Modules\ERP\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class QuoteRequestRequest extends FormRequest
{
    private ?Customer $matchedCustomer = null;
    private bool $customerResolved = false;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isExistingCustomer = $this->matchedCustomer() !== null;

        return [
            // Customer identification / creation
            'full_name' => [$isExistingCustomer ? 'nullable' : 'required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'email' => [
                $isExistingCustomer ? 'nullable' : 'required',
                'email',
                Rule::unique('customers', 'email')->ignore($this->matchedCustomer()?->id),
            ],
            'phone' => [
                $isExistingCustomer ? 'nullable' : 'required',
                'string',
                'max:30',
                Rule::unique('customers', 'phone')->ignore($this->matchedCustomer()?->id),
            ],
            'address' => [$isExistingCustomer ? 'nullable' : 'required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],

            // Quote request
            'prefered_contact' => ['nullable', 'in:telephone,email,phone'],
            'comment' => ['nullable', 'string'],

            // Items — at least one required
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'full_name.required' => 'Le nom complet est requis pour une première demande de devis',
            'email.required' => 'L\'email est requis',
            'email.email' => 'L\'email doit être une adresse valide',
            'email.unique' => 'Cet email est déjà utilisé par un autre client',
            'phone.required' => 'Le téléphone est requis',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé par un autre client',
            'address.required' => 'L\'adresse est requise pour une première demande de devis',
            'prefered_contact.in' => 'Le moyen de contact préféré est invalide',
            'items.required' => 'Au moins un article est requis',
            'items.min' => 'Au moins un article est requis',
            'items.*.product_id.required' => 'Le produit est requis',
            'items.*.product_id.exists' => 'Le produit sélectionné n\'existe pas',
            'items.*.quantity.required' => 'La quantité est requise',
            'items.*.quantity.min' => 'La quantité doit être au moins 1',
        ];
    }

    /**
     * Resolve (and cache) the customer matching the submitted email or phone.
     * Null means this is a brand new customer — full details will be required.
     * The controller can reuse this instead of re-querying.
     */
    public function matchedCustomer(): ?Customer
    {
        if ($this->customerResolved) {
            return $this->matchedCustomer;
        }

        $email = $this->input('email');
        $phone = $this->input('phone');

        if ($email || $phone) {
            $this->matchedCustomer = Customer::where(function ($query) use ($email, $phone) {
                $query->when($email, fn($q) => $q->orWhere('email', $email))
                    ->when($phone, fn($q) => $q->orWhere('phone', $phone));
            })->first();
        }

        $this->customerResolved = true;

        return $this->matchedCustomer;
    }
}
