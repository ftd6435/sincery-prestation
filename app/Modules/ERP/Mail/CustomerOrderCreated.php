<?php

namespace App\Modules\ERP\Mail;

use App\Modules\ERP\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerOrderCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $createdDateFr,
        public float $subtotal,
        public int $itemsCount,
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
                    $this->order->customer->email,
                    $this->order->customer->full_name,
                ),
            ],
            replyTo: [
                new Address(
                    (string) env('CONTACT_ADMIN_EMAIL', (string) config('mail.from.address', 'contact@sincery-pres.com')),
                    (string) env('CONTACT_ADMIN_NAME', (string) config('mail.from.name', 'Sincery Prestations')),
                ),
            ],
            subject: "[Commande {$this->order->reference}] Votre commande Sincery Prestations a bien été enregistrée",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.erp.customer-order-created',
            with: [
                'order' => $this->order,
                'customerName' => $this->order->customer->full_name,
                'reference' => $this->order->reference,
                'createdDateFr' => $this->createdDateFr,
                'subtotal' => $this->subtotal,
                'itemsCount' => $this->itemsCount,
                'deliveryMode' => $this->order->delivery_mode,
                'deliveryAddress' => $this->order->delivery_mode === 'Livraison'
                    ? trim(($this->order->customer->address ?? '') . ' ' . ($this->order->customer->city ?? '') . ' ' . ($this->order->customer->country ?? ''))
                    : null,
            ],
        );
    }
}
