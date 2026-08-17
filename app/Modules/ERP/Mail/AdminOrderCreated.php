<?php

namespace App\Modules\ERP\Mail;

use App\Modules\ERP\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminOrderCreated extends Mailable
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
                    (string) env('CONTACT_ADMIN_EMAIL', (string) config('mail.from.address', 'contact@sincery-pres.com')),
                    (string) env('CONTACT_ADMIN_NAME', (string) config('mail.from.name', 'Sincery Prestations')),
                ),
            ],
            replyTo: [
                new Address(
                    $this->order->customer->email,
                    $this->order->customer->full_name,
                ),
            ],
            subject: "[NOUVELLE COMMANDE {$this->order->reference}] {$this->order->customer->full_name} — {$this->itemsCount} article(s)",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.erp.admin-order-created',
            with: [
                'order' => $this->order,
                'customerName' => $this->order->customer->full_name,
                'customerCompany' => $this->order->customer->company_name,
                'customerEmail' => $this->order->customer->email,
                'customerPhone' => $this->order->customer->phone,
                'customerAddress' => trim(($this->order->customer->address ?? '') . ' ' . ($this->order->customer->city ?? '') . ' ' . ($this->order->customer->country ?? '')),
                'reference' => $this->order->reference,
                'createdDateFr' => $this->createdDateFr,
                'subtotal' => $this->subtotal,
                'itemsCount' => $this->itemsCount,
                'deliveryMode' => $this->order->delivery_mode,
                'comment' => $this->order->comment,
                'items' => $this->order->items,
            ],
        );
    }
}
