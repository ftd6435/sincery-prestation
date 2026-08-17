<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Devis {{ $quoteRequest->reference }} — Sincery Prestations</title>
    <style>
        @page {
            margin: 1.4cm 1.2cm 2.2cm 1.2cm;
        }
        * { box-sizing: border-box; }
        body {
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            color: #0f172a;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* ——— HEADER ——— */
        .header {
            border-bottom: 2px solid #c01724;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .brand-logo {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            object-fit: contain;
            display: block;
        }
        .brand-titles h1 {
            font-size: 20px;
            color: #c01724;
            margin: 0 0 2px 0;
            font-weight: 800;
            letter-spacing: -0.01em;
        }
        .brand-titles p {
            font-size: 10.5pt;
            color: #64748b;
            margin: 0;
        }
        .quote-meta {
            text-align: right;
            font-size: 10.5pt;
        }
        .quote-meta .ref {
            font-size: 17px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
        }
        .quote-meta .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 9pt;
            font-weight: 600;
            margin-top: 4px;
        }
        .status-sent {
            background: #e0e7ff;
            color: #3730a3;
        }
        .header-row {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            padding-top: 10px;
        }
        .company-col, .customer-col {
            width: 45%;
        }
        .company-col h2, .customer-col h2 {
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #64748b;
            margin: 0 0 6px 0;
            font-weight: 600;
            padding-bottom: 3px;
            border-bottom: 1px solid #e2e8f0;
        }
        .company-col p, .customer-col p {
            font-size: 10.5pt;
            margin: 2px 0;
            color: #1e293b;
        }
        .company-col a, .customer-col a {
            color: #c01724;
            text-decoration: none;
        }
        .customer-col .cust-name {
            font-weight: 700;
            color: #0f172a;
            font-size: 12pt;
            margin: 2px 0 4px 0;
        }

        /* ——— TITLE BAR ——— */
        .doc-title {
            background: linear-gradient(135deg, #c01724 0%, #e41d2e 100%);
            color: #ffffff;
            padding: 14px 22px;
            border-radius: 8px;
            margin: 22px 0 16px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .doc-title h3 {
            margin: 0;
            font-size: 14pt;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .doc-title .dates {
            font-size: 10pt;
            opacity: 0.92;
            text-align: right;
        }

        /* ——— TABLE ——— */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0 16px 0;
            font-size: 10pt;
        }
        .items-table thead th {
            background: #f8fafc;
            color: #0f172a;
            font-weight: 700;
            text-align: left;
            padding: 10px 10px;
            border: 1px solid #e2e8f0;
            font-size: 9.5pt;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
        .items-table thead th.num,
        .items-table thead th.qty,
        .items-table thead th.price,
        .items-table thead th.total {
            text-align: right;
        }
        .items-table tbody td {
            padding: 10px 10px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            color: #1e293b;
        }
        .items-table tbody td.num,
        .items-table tbody td.qty,
        .items-table tbody td.price,
        .items-table tbody td.total {
            text-align: right;
        }
        .items-table tbody td.prod-name {
            font-weight: 600;
            color: #0f172a;
        }
        .items-table tbody td.prod-unit {
            color: #64748b;
            font-size: 9pt;
            font-style: italic;
        }
        .items-table tbody tr:nth-child(even) td {
            background: #fcfcfd;
        }
        .items-table tbody tr:hover td {
            background: #f8fafc;
        }
        .price-tag::before { content: "GNF "; }
        .price-total::before { content: "GNF "; font-weight: 700; }
        .unit-cell { white-space: nowrap; }

        /* ——— TOTALS ——— */
        .totals-wrapper {
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            gap: 40px;
        }
        .totals {
            width: 45%;
            margin-left: auto;
            font-size: 10.5pt;
        }
        .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 6px 4px;
            border-bottom: 1px dashed #e2e8f0;
        }
        .totals .row.grand {
            background: #fef2f2;
            border: 1px solid #c01724;
            border-radius: 6px;
            margin-top: 8px;
            padding: 10px 12px;
            font-weight: 700;
            color: #c01724;
            font-size: 12.5pt;
        }
        .totals .row.grand .label { color: #c01724; }
        .totals .label { color: #64748b; }
        .totals .value { color: #0f172a; font-weight: 600; }

        /* ——— NOTES ——— */
        .notes {
            margin-top: 22px;
            padding: 14px 16px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-left: 4px solid #d97706;
            border-radius: 6px;
        }
        .notes h4 {
            margin: 0 0 6px 0;
            font-size: 10.5pt;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .notes ul {
            padding-left: 18px;
            margin: 4px 0 0 0;
        }
        .notes li {
            font-size: 9.8pt;
            color: #78350f;
            margin: 2px 0;
        }

        /* ——— COMMENTS ——— */
        .comments {
            margin-top: 18px;
            padding: 12px 16px;
            background: #f1f5f9;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .comments h4 {
            margin: 0 0 6px 0;
            font-size: 10.5pt;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .comments p {
            margin: 0;
            color: #1e293b;
            font-size: 10pt;
            white-space: pre-wrap;
        }

        /* ——— QR CODE AREA ——— */
        .qr-block {
            margin-top: 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 18px;
        }
        .qr-text {
            width: 65%;
            font-size: 9.8pt;
            color: #475569;
        }
        .qr-text strong { color: #c01724; }
        .qr-code {
            width: 30%;
            text-align: center;
        }
        .qr-code img {
            max-width: 140px;
            height: auto;
            display: block;
            margin: 0 auto 6px;
            border: 2px solid #e2e8f0;
            padding: 4px;
            background: #fff;
            border-radius: 6px;
        }
        .qr-code .qr-label {
            font-size: 8.5pt;
            color: #64748b;
            margin-top: 2px;
        }

        /* ——— FOOTER ——— */
        .footer {
            position: fixed;
            bottom: -1.1cm;
            left: 0;
            right: 0;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            text-align: center;
            color: #64748b;
            font-size: 8.5pt;
            line-height: 1.6;
        }
        .footer a {
            color: #c01724;
            text-decoration: none;
        }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>

    {{-- HEADER --}}
    <div class="header">
        <div class="header-top">
            <div class="brand">
                @if (file_exists(public_path('logos/sp-black-logo.jpeg')))
                    <img src="{{ public_path('logos/sp-black-logo.jpeg') }}" alt="Sincery Prestations" class="brand-logo">
                @else
                    <div class="brand-logo" style="background: linear-gradient(135deg, #c01724, #e41d2e); text-align: center; line-height: 56px; color: white; font-weight: 900; font-size: 22px;">S</div>
                @endif
                <div class="brand-titles">
                    <h1>{{ $company['name'] }}</h1>
                    <p>{{ $company['tagline'] }}</p>
                </div>
            </div>
            <div class="quote-meta">
                <p class="ref">DEVIS</p>
                <p style="margin: 2px 0 0 0; color: #c01724; font-weight: 600;">{{ $quoteRequest->reference }}</p>
                @php
                    $statusLabel = [
                        'new' => 'Nouveau',
                        'pending' => 'En cours',
                        'sent' => 'Envoyé au client',
                        'approved' => 'Approuvé',
                        'rejected' => 'Rejeté',
                    ][$quoteRequest->status] ?? $quoteRequest->status;
                @endphp
                <div>
                    <span class="status-badge status-sent">{{ $statusLabel }}</span>
                </div>
            </div>
        </div>

        <div class="header-row">
            <div class="company-col">
                <h2>Émetteur</h2>
                <p style="font-weight:700; color:#c01724;">{{ $company['name'] }}</p>
                <p>{{ $company['address'] }}</p>
                <p>Téléphone : <a href="tel:{{ preg_replace('/\s+/u', '', $company['phone']) }}">{{ $company['phone'] }}</a></p>
                <p>Email : <a href="mailto:{{ $company['email'] }}">{{ $company['email'] }}</a></p>
            </div>
            <div class="customer-col">
                <h2>Client</h2>
                <p class="cust-name">{{ $quoteRequest->customer->full_name }}</p>
                @if ($quoteRequest->customer->company_name)
                    <p>{{ $quoteRequest->customer->company_name }}</p>
                @endif
                <p>{{ $quoteRequest->customer->address }}</p>
                @if ($quoteRequest->customer->city || $quoteRequest->customer->country)
                    <p>{{ trim(($quoteRequest->customer->city ?? '').' — '.($quoteRequest->customer->country ?? ''), ' —') }}</p>
                @endif
                <p>Téléphone : <a href="tel:{{ preg_replace('/\s+/u', '', $quoteRequest->customer->phone) }}">{{ $quoteRequest->customer->phone }}</a></p>
                <p>Email : <a href="mailto:{{ $quoteRequest->customer->email }}">{{ $quoteRequest->customer->email }}</a></p>
            </div>
        </div>
    </div>

    {{-- TITLE BAR --}}
    <div class="doc-title">
        <h3>Proposition chiffrée</h3>
        <div class="dates">
            <div>Date d'émission : <strong>{{ $issueDateFr }}</strong></div>
            <div>Valable jusqu'au : <strong>{{ $validityDateFr }}</strong></div>
        </div>
    </div>

    {{-- ITEMS TABLE --}}
    <table class="items-table">
        <thead>
            <tr>
                <th class="num" style="width: 4%;">#</th>
                <th style="width: 48%;">Désignation</th>
                <th class="qty" style="width: 10%;">Qté</th>
                <th style="width: 10%;">Unité</th>
                <th class="price" style="width: 14%;">PU (GNF)</th>
                <th class="total" style="width: 14%;">Total (GNF)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $i => $item)
                <tr>
                    <td class="num">{{ $i + 1 }}</td>
                    <td>
                        <div class="prod-name">{{ $item->product_name_snapshot }}</div>
                    </td>
                    <td class="qty">{{ number_format($item->quantity, 0, ',', ' ') }}</td>
                    <td class="unit-cell">{{ $item->product_unit_snapshot }}</td>
                    <td class="price price-tag">{{ number_format((float) $item->price_snapshot, 0, ',', ' ') }}</td>
                    <td class="total price-total">{{ number_format((float) $item->total_price, 0, ',', ' ') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- TOTALS --}}
    <div class="totals-wrapper">
        <div style="width: 45%;"></div>
        <div class="totals">
            <div class="row">
                <span class="label">Sous-total ({{ $itemsCount }} article{{ $itemsCount > 1 ? 's' : '' }})</span>
                <span class="value price-tag">{{ number_format($subtotal, 0, ',', ' ') }}</span>
            </div>
            <div class="row">
                <span class="label">Remise</span>
                <span class="value">—</span>
            </div>
            <div class="row">
                <span class="label">Livraison</span>
                <span class="value">Sur devis</span>
            </div>
            <div class="row grand">
                <span class="label">Total TTC</span>
                <span class="value price-tag">{{ number_format($subtotal, 0, ',', ' ') }} GNF</span>
            </div>
        </div>
    </div>

    {{-- NOTE --}}
    <div class="notes">
        <h4>⚠ Important — Conditions de validité</h4>
        <ul>
            <li>Ce devis est valable jusqu'au <strong>{{ $validityDateFr }}</strong> inclus. Passé ce délai, les prix et la disponibilité des produits sont susceptibles d'être révisés.</li>
            <li>Pour <strong>approuver</strong> ou <strong>rejeter</strong> ce devis, rendez-vous sur la page client accessible via le QR code ci-contre, ou contactez votre conseiller.</li>
            <li>Toute commande est ferme après réception d'un bon de commande signé et du versement d'un acompte (conditions précisées par votre conseiller).</li>
            <li>Les prix indiqués sont exprimés en <strong>Franc Guinéen (GNF)</strong> et hors frais de livraison, sauf mention contraire.</li>
        </ul>
    </div>

    {{-- CUSTOMER COMMENTS IF ANY --}}
    @if (!empty($quoteRequest->comment))
        <div class="comments">
            <h4>📝 Remarque du client lors de la demande</h4>
            <p>{{ $quoteRequest->comment }}</p>
        </div>
    @endif

    {{-- QR CODE AREA --}}
    <div class="qr-block">
        <div class="qr-text">
            <p>Vous pouvez consulter ce devis en ligne, l'approuver ou le rejeter en <strong>scannant le QR code</strong> ci-contre avec votre téléphone.</p>
            <p style="margin-top: 6px;">URL directe : <a href="{{ $viewQuoteUrl }}" style="word-break: break-all;">{{ $viewQuoteUrl }}</a></p>
            <p style="margin-top: 6px; font-size: 9pt; color: #64748b;">
                Référence du devis : <strong>{{ $quoteRequest->reference }}</strong><br>
                Généré le {{ $issueDateFr }} — QR code unique, valable jusqu'au {{ $validityDateFr }}.
            </p>
        </div>
        <div class="qr-code">
            {!! $qrCodeSvg !!}
            <div class="qr-label">Scanner pour voir / approuver / rejeter</div>
        </div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        <strong>{{ $company['name'] }}</strong> &nbsp;·&nbsp; {{ $company['address'] }} &nbsp;·&nbsp;
        Tél. <a href="tel:{{ preg_replace('/\s+/u', '', $company['phone']) }}">{{ $company['phone'] }}</a> &nbsp;·&nbsp;
        <a href="mailto:{{ $company['email'] }}">{{ $company['email'] }}</a>
        <br>Nongo, Conakry — République de Guinée &nbsp;·&nbsp; SARL au capital de 50 000 000 GNF &nbsp;·&nbsp; RCCM n° GN-CKR-2024-Axxxxx
    </div>

</body>
</html>
