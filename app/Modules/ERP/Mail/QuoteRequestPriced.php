<?php

namespace App\Modules\ERP\Mail;

use App\Modules\ERP\Models\QuoteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteRequestPriced extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public QuoteRequest $quoteRequest,
        public string $validityDateFr,
        public string $issueDateFr,
        public string $viewQuoteUrl,
        public string $pdfPath,
        public string $pdfFileName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', 'contact@sincery-pres.com'),
                (string) config('mail.from.name', 'Sincery Prestations'),
            ),
            to: [
                new Address(
                    $this->quoteRequest->customer->email,
                    $this->quoteRequest->customer->full_name,
                ),
            ],
            cc: [
                new Address(
                    (string) env('CONTACT_ADMIN_EMAIL', (string) config('mail.from.address', 'contact@sincery-pres.com')),
                    (string) env('CONTACT_ADMIN_NAME', (string) config('mail.from.name', 'Sincery Prestations')),
                ),
            ],
            replyTo: [
                new Address(
                    (string) env('CONTACT_ADMIN_EMAIL', (string) config('mail.from.address', 'contact@sincery-pres.com')),
                    (string) env('CONTACT_ADMIN_NAME', (string) config('mail.from.name', 'Sincery Prestations')),
                ),
            ],
            subject: "[Devis {$this->quoteRequest->reference}] Votre proposition chiffrée Sincery Prestations",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.erp.quote-request-priced',
            with: [
                'quoteRequest' => $this->quoteRequest,
                'customerName' => $this->quoteRequest->customer->full_name,
                'reference' => $this->quoteRequest->reference,
                'validityDateFr' => $this->validityDateFr,
                'viewQuoteUrl' => $this->viewQuoteUrl,
                'itemsCount' => $this->quoteRequest->items()->count(),
                'subtotal' => $this->quoteRequest->items()->sum('total_price'),
                'preferedContact' => $this->quoteRequest->prefered_contact ?? 'email',
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('local', $this->pdfPath)
                ->as($this->pdfFileName)
                ->withMime('application/pdf'),
        ];
    }
}
