<?php

namespace App\Modules\ERP\Requests;

use App\Modules\ERP\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Override;

class OrderRequest extends FormRequest
{
    private ?Customer $matchedCustomer = null;
    private bool $customerResolved = false;

    public const DELIVERY_MODES = ['Livraison', 'Retrait boutique'];
    public const STATUSES = ['new', 'pending', 'confirmed', 'delivered', 'canceled'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isExistingCustomer = $this->matchedCustomer() !== null;

        $rules = [
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

            // Order
            'delivery_mode' => ['required', Rule::in(self::DELIVERY_MODES)],
            'comment' => ['nullable', 'string'],
            'internal_notes' => ['nullable', 'string'],

            // Items — at least one required
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];

        // Admin-only fields (only validated when the request comes from an admin)
        if (Auth::check()) {
            $rules['status'] = ['nullable', Rule::in(self::STATUSES)];
        }

        return $rules;
    }

    #[Override]
    public function messages()
    {
        return [
            'full_name.required' => 'Le nom complet est requis pour une première commande',
            'email.required' => 'L\'email est requis',
            'email.email' => 'L\'email doit être une adresse valide',
            'email.unique' => 'Cet email est déjà utilisé par un autre client',
            'phone.required' => 'Le téléphone est requis',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé par un autre client',
            'address.required' => 'L\'adresse est requise pour une première commande',
            'delivery_mode.required' => 'Le mode de livraison est requis',
            'delivery_mode.in' => 'Le mode de livraison doit être « Livraison » ou « Retrait boutique »',
            'status.in' => 'Statut invalide (new, pending, confirmed, delivered, canceled)',
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
