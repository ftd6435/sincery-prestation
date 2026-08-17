@extends('emails.layouts.brand')

@section('title', '[NOUVELLE COMMANDE] ' . $reference . ' — ' . $customerName)

@section('email_content')
    <h2>🔔 Nouvelle commande réceptionnée</h2>

    <p class="lead">
        Une <strong>nouvelle commande</strong> vient d'être placée sur le site Sincery Prestations
        par <strong>{{ $customerName }}</strong>.
    </p>

    <div class="alert alert-warning">
        <strong>⚠ Action requise :</strong> Ouvrir la commande dans l'admin, la basculer en « En cours »
        puis la valider / contacter le client pour finaliser la commande.
    </div>

    <div class="info-card">
        <dl>
            <dt>Référence</dt>
            <dd><strong>{{ $reference }}</strong></dd>

            <dt>Passée le</dt>
            <dd>{{ $createdDateFr }}</dd>

            <dt>Client</dt>
            <dd>
                <strong>{{ $customerName }}</strong>
                @if ($customerCompany)
                    <br><span style="color:#475569;">{{ $customerCompany }}</span>
                @endif
            </dd>

            <dt>Téléphone</dt>
            <dd><a href="tel:{{ preg_replace('/\s+/u', '', $customerPhone) }}">{{ $customerPhone }}</a></dd>

            <dt>Email</dt>
            <dd><a href="mailto:{{ $customerEmail }}">{{ $customerEmail }}</a></dd>

            <dt>Adresse</dt>
            <dd>{{ $customerAddress }}</dd>

            <dt>Mode de retrait</dt>
            <dd>{{ $deliveryMode }}</dd>

            <dt>Articles</dt>
            <dd>{{ $itemsCount }} article{{ $itemsCount > 1 ? 's' : '' }} —
                <strong>{{ number_format($subtotal, 0, ',', ' ') }} GNF</strong></dd>
        </dl>
    </div>

    @if (!empty($comment))
        <div class="info-card" style="border-left-color:#0f766e;">
            <dl>
                <dt>Remarque du client</dt>
                <dd class="message-body">{{ $comment }}</dd>
            </dl>
        </div>
    @endif

    <h3 style="font-size:16px; margin: 18px 0 8px;">Détail des articles</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
            <tr style="background:#f8fafc;">
                <th style="padding:8px 10px; border:1px solid #e2e8f0; text-align:left;">#</th>
                <th style="padding:8px 10px; border:1px solid #e2e8f0; text-align:left;">Désignation</th>
                <th style="padding:8px 10px; border:1px solid #e2e8f0; text-align:right;">Qté</th>
                <th style="padding:8px 10px; border:1px solid #e2e8f0; text-align:right;">PU</th>
                <th style="padding:8px 10px; border:1px solid #e2e8f0; text-align:right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $i => $item)
                <tr @if ($i % 2 === 1) style="background:#fcfcfd;" @endif>
                    <td style="padding:8px 10px; border:1px solid #e2e8f0; text-align:right;">{{ $i + 1 }}</td>
                    <td style="padding:8px 10px; border:1px solid #e2e8f0;">
                        <strong>{{ $item->product_name_snapshot }}</strong>
                        <div style="font-size:12px; color:#64748b;">
                            @if ($item->product_unit_snapshot)
                                Unité : {{ $item->product_unit_snapshot }}
                            @endif
                        </div>
                    </td>
                    <td style="padding:8px 10px; border:1px solid #e2e8f0; text-align:right;">
                        {{ number_format($item->quantity, 0, ',', ' ') }}</td>
                    <td style="padding:8px 10px; border:1px solid #e2e8f0; text-align:right;">
                        {{ number_format((float) $item->price_snapshot, 0, ',', ' ') }} GNF</td>
                    <td style="padding:8px 10px; border:1px solid #e2e8f0; text-align:right;">
                        <strong>{{ number_format((float) $item->total_price, 0, ',', ' ') }} GNF</strong></td>
                </tr>
            @endforeach
            <tr style="background:#fef2f2; font-weight:700;">
                <td colspan="4" style="padding:10px; border:1px solid #e2e8f0; text-align:right;">TOTAL TTC</td>
                <td style="padding:10px; border:1px solid #c01724; text-align:right; color:#c01724;">
                    {{ number_format($subtotal, 0, ',', ' ') }} GNF</td>
            </tr>
        </tbody>
    </table>

    <div class="divider"></div>

    <p class="signature" style="color:#475569; font-size:15px; margin-top:16px;">
        — Notification automatique depuis l'ERP Sincery Prestations
    </p>
@endsection
