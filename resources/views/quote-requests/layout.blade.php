<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') — Sincery Prestations</title>
    <link rel="icon" type="image/png" href="{{ asset('logos/favicon.png') }}">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #f7f7f8 0%, #e2e8f0 100%);
            color: #0f172a;
            min-height: 100vh;
            padding: 24px 16px;
        }

        .wrapper {
            max-width: 980px;
            margin: 0 auto;
        }

        /* Header */
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            border-radius: 16px;
            padding: 18px 24px;
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-logo {
            width: 44px;
            height: 44px;
            border-radius: 9999px;
            background: #fff;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
            object-fit: contain;
        }

        .brand-logo img {
            max-width: 100%;
            max-height: 100%;
        }

        .brand h1 {
            font-size: 18px;
            color: #c01724;
            font-weight: 800;
            line-height: 1.1;
        }

        .brand p {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
        }

        .ref-chip {
            background: linear-gradient(135deg, #c01724 0%, #e41d2e 100%);
            color: #fff;
            padding: 8px 16px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 14px;
        }

        /* Body card */
        .card {
            background: #fff;
            border-radius: 16px;
            padding: 36px;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
            border: 1px solid #e2e8f0;
        }

        .card-header {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 2px solid #c01724;
        }

        .card-header h2 {
            font-size: 24px;
            color: #0f172a;
            margin-bottom: 6px;
        }

        .card-header .dates {
            font-size: 14px;
            color: #475569;
            margin-top: 6px;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.02em;
            text-transform: uppercase;
        }

        .status-new {
            background: #e0e7ff;
            color: #3730a3;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        .status-sent {
            background: #dbeafe;
            color: #1d4ed8;
        }

        .status-approved {
            background: #dcfce7;
            color: #166534;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        /* Columns */
        .two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 28px;
        }

        .col-block h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
        }

        .col-block p {
            font-size: 14.5px;
            color: #1e293b;
            line-height: 1.65;
            margin: 2px 0;
        }

        .col-block a {
            color: #c01724;
            text-decoration: none;
            font-weight: 500;
        }

        .col-block .name {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
        }

        .col-block .name.cust {
            color: #0f172a;
        }

        .col-block .name.comp {
            color: #c01724;
        }

        /* Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14.5px;
            margin-bottom: 16px;
        }

        .items-table thead th {
            background: #f8fafc;
            padding: 12px 14px;
            text-align: left;
            border: 1px solid #e2e8f0;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.04em;
            color: #0f172a;
        }

        .items-table th.num,
        .items-table th.qty,
        .items-table th.price,
        .items-table th.total {
            text-align: right;
        }

        .items-table tbody td {
            padding: 12px 14px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }

        .items-table td.num,
        .items-table td.qty,
        .items-table td.price,
        .items-table td.total {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }

        .items-table .p-name {
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 2px;
        }

        .items-table .p-unit {
            font-size: 12px;
            color: #64748b;
            font-style: italic;
        }

        .items-table tr:nth-child(even) td {
            background: #fcfcfd;
        }

        /* Totals */
        .totals-wrap {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
        }

        .totals {
            width: 360px;
            font-size: 15px;
        }

        .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-bottom: 1px dashed #e2e8f0;
        }

        .totals .row.grand {
            background: linear-gradient(135deg, #fff1f2, #ffe4e6);
            border: 1.5px solid #c01724;
            border-radius: 10px;
            margin-top: 8px;
            padding: 12px 16px;
            font-weight: 800;
            font-size: 17px;
            color: #c01724;
        }

        .totals .row.grand .label {
            color: #c01724;
        }

        .totals .label {
            color: #64748b;
            font-weight: 500;
        }

        .totals .value {
            color: #0f172a;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
        }

        /* Note */
        .notes {
            background: #fffbeb;
            border-left: 4px solid #d97706;
            border: 1px solid #fde68a;
            padding: 18px 20px;
            border-radius: 10px;
            margin: 24px 0;
        }

        .notes h4 {
            color: #92400e;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 10px;
        }

        .notes ul {
            padding-left: 18px;
            margin: 0;
        }

        .notes li {
            color: #78350f;
            font-size: 14px;
            margin: 4px 0;
            line-height: 1.55;
        }

        .notes strong {
            color: #c01724;
        }

        /* Actions */
        .actions-box {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-top: 26px;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
        }

        .actions-box .text {
            flex: 1;
            min-width: 260px;
        }

        .actions-box h3 {
            font-size: 16px;
            color: #0f172a;
            margin-bottom: 4px;
        }

        .actions-box p {
            font-size: 13.5px;
            color: #64748b;
            line-height: 1.5;
        }

        .actions-box .buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 22px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.18s ease;
            border: 1.5px solid transparent;
            text-decoration: none;
            line-height: 1.1;
        }

        .btn:hover {
            transform: translateY(-1px);
        }

        .btn-approve {
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
            box-shadow: 0 6px 18px rgba(22, 163, 74, 0.25);
        }

        .btn-approve:hover {
            background: linear-gradient(135deg, #15803d, #16a34a);
        }

        .btn-reject {
            background: #fff;
            border-color: #991b1b;
            color: #991b1b;
        }

        .btn-reject:hover {
            background: #fef2f2;
        }

        .btn-disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }

        /* Comment */
        .customer-comment {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px 18px;
            margin-top: 22px;
        }

        .customer-comment h4 {
            color: #334155;
            font-size: 12.5px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 6px;
        }

        .customer-comment p {
            color: #1e293b;
            font-size: 14px;
            white-space: pre-wrap;
        }

        /* Footer */
        .page-footer {
            text-align: center;
            padding: 28px 24px 16px;
            color: #64748b;
            font-size: 12.5px;
        }

        .page-footer strong {
            color: #0f172a;
        }

        .page-footer a {
            color: #c01724;
            text-decoration: none;
        }

        @media (max-width: 768px) {
            .card {
                padding: 20px;
            }

            .two-col {
                grid-template-columns: 1fr;
                gap: 20px;
            }

            .page-header {
                padding: 14px 16px;
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }

            .actions-box {
                padding: 18px;
            }

            .actions-box .buttons {
                width: 100%;
            }

            .actions-box .buttons .btn {
                flex: 1;
            }

            .totals-wrap .totals {
                width: 100%;
            }

            .items-table {
                font-size: 13px;
            }
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="page-header">
            <div class="brand">
                <div class="brand-logo">
                    @if (file_exists(public_path('logos/sp-black-logo.jpeg')))
                        <img src="{{ asset('logos/sp-black-logo.jpeg') }}" alt="Sincery Prestations">
                    @else
                        <div
                            style="width: 100%; height: 100%; background: linear-gradient(135deg, #c01724, #e41d2e); color: white; font-weight: 900; display: flex; align-items: center; justify-content: center; border-radius: 999px; font-size: 18px;">
                            S</div>
                    @endif
                </div>
                <div>
                    <h1>Sincery Prestations</h1>
                    <p>Équipements professionnels — EPI, sécurité, engins, matériel</p>
                </div>
            </div>
            <div class="ref-chip">Devis {{ $quoteRequest->reference }}</div>
        </div>

        <div class="card">
            @yield('content')
        </div>

        <div class="page-footer">
            <strong>Sincery Prestations</strong> &nbsp;·&nbsp; Nongo, Conakry — Rép. de Guinée<br>
            Tél. <a href="tel:+224622146714">+224 622 14 67 14</a> &nbsp;·&nbsp;
            <a href="mailto:contact@sincery-pres.com">contact@sincery-pres.com</a>
        </div>
    </div>
</body>

</html>
