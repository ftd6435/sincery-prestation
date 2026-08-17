<?php

namespace App\Modules\ERP\Mail;


use App\Modules\ERP\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerOrderStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $newStatusLabel,
        public string $statusDateFr,
        public ?string $customIntro = null,
    ) {}

    public function envelope(): Envelope
    {
        $ref = $this->order->reference;

        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', 'contact@sincery-pres.com'),
                (string) config('mail.from.name', 'Sincery Prestations'),
            ),
            to: [
                new Address(
                    $this->order->customer->email,
                    $this->order->customer->full_name,
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
            subject: "[Commande {$ref}] Statut : {$this->newStatusLabel}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.erp.customer-order-status-changed',
            with: [
                'order' => $this->order,
                'customerName' => $this->order->customer->full_name,
                'reference' => $this->order->reference,
                'newStatusLabel' => $this->newStatusLabel,
                'statusDateFr' => $this->statusDateFr,
                'deliveryMode' => $this->order->delivery_mode,
                'subtotal' => (float) $this->order->items->sum('total_price'),
                'itemsCount' => $this->order->items->count(),
                'customIntro' => $this->customIntro,
            ],
        );
    }
}
