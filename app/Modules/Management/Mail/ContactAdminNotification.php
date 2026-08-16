<?php

namespace App\Modules\Management\Mail;

use App\Modules\Management\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Contact $contact,
    ) {}

    public function envelope(): Envelope
    {
        $toAddress = (string) env('CONTACT_ADMIN_EMAIL', config('mail.from.address', 'contact@sincery-pres.com'));
        $toName = (string) env('CONTACT_ADMIN_NAME', config('mail.from.name', 'Sincery Prestations'));

        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', 'contact@sincery-pres.com'),
                (string) config('mail.from.name', 'Sincery Prestations')
            ),
            to: [new Address($toAddress, $toName)],
            replyTo: [new Address($this->contact->email, $this->contact->name)],
            subject: "[Sincery Prestations] Nouveau contact : {$this->contact->subject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact.admin-notification',
            with: [
                'contact' => $this->contact,
            ],
        );
    }
}
