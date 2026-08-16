<?php

namespace App\Modules\Management\Mail;

use App\Modules\Management\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactCustomerConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Contact $contact,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', 'contact@sincery-pres.com'),
                (string) config('mail.from.name', 'Sincery Prestations')
            ),
            to: [new Address($this->contact->email, $this->contact->name)],
            subject: 'Nous avons bien reçu votre message — Sincery Prestations',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact.customer-confirmation',
            with: [
                'contact' => $this->contact,
            ],
        );
    }
}
