<?php

namespace App\Modules\Settings\Mail;

use App\Modules\Settings\Models\Newsletter;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterVerification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Newsletter $newsletter,
        public string $verifyUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', 'contact@sincery-pres.com'),
                (string) config('mail.from.name', 'Sincery Prestations')
            ),
            to: [new Address($this->newsletter->email, $this->newsletter->name)],
            subject: 'Confirmez votre abonnement à la newsletter Sincery Prestations',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter.verify',
            with: [
                'name' => $this->newsletter->name,
                'email' => $this->newsletter->email,
                'verifyUrl' => $this->verifyUrl,
            ],
        );
    }
}
