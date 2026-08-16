<?php

namespace App\Modules\Management\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Management\Mail\ContactAdminNotification;
use App\Modules\Management\Mail\ContactCustomerConfirmation;
use App\Modules\Management\Models\Contact;
use App\Modules\Management\Requests\ContactRequest;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $contacts = Contact::query();

        $contacts = $contacts->where('name', 'like', "%{$request->input('name', '')}%");
        $contacts = $contacts->where('status', 'like', "%{$request->input('status', '')}%");
        $contacts = $contacts->where('phone', 'like', "%{$request->input('phone', '')}%");
        $contacts = $contacts->where('subject', 'like', "%{$request->input('subject', '')}%");

        $contacts = $contacts->orderBy('created_at', 'desc')->get();

        return $this->successResponse($contacts, "La liste des contacts a été récupérée avec succès");
    }

    public function show(Contact $contact)
    {
        if ($contact->status === "new") {
            $contact->status = "read";
            $contact->save();
        }

        return $this->successResponse($contact, "Le contact a été mis à jour avec succès");
    }

    public function store(ContactRequest $request)
    {
        $contact = Contact::create($request->validated());

        $adminMailError = null;
        $customerMailError = null;

        // 1) E-mail de notification à l'administrateur (équipe commerciale Sincery)
        try {
            $adminAddress = (string) env('CONTACT_ADMIN_EMAIL', config('mail.from.address', 'contact@sincery-pres.com'));
            if ($adminAddress !== '') {
                Mail::to($adminAddress)->queue(new ContactAdminNotification($contact));
            }
        } catch (\Throwable $e) {
            report($e);
            $adminMailError = $e->getMessage();
        }

        // 2) E-mail d'accusé de réception au visiteur (confirmation de bonne réception)
        try {
            Mail::to($contact->email, $contact->name)
                ->queue(new ContactCustomerConfirmation($contact));
        } catch (\Throwable $e) {
            report($e);
            $customerMailError = $e->getMessage();
        }

        $meta = ['email_sent_to_admin' => $adminMailError === null, 'email_sent_to_customer' => $customerMailError === null];
        if ($adminMailError) {
            $meta['admin_mail_error'] = $adminMailError;
        }
        if ($customerMailError) {
            $meta['customer_mail_error'] = $customerMailError;
        }

        $message = "Le contact a été créé avec succès";
        if (! $adminMailError && ! $customerMailError) {
            $message = "Votre message a bien été envoyé. Un accusé de réception vient de vous être envoyé par e-mail.";
        } elseif (! $customerMailError) {
            $message = "Le contact a été enregistré et un accusé de réception vous a été envoyé.";
        }

        return $this->successResponse(
            ['contact' => $contact, 'meta' => $meta],
            $message,
            $meta['email_sent_to_customer'] ? 201 : 202,
        );
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return $this->noContentSuccessResponse("Le contact a été supprimé avec succès");
    }
}
