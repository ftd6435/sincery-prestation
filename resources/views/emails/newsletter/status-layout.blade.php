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
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .card {
            max-width: 560px;
            width: 100%;
            background: #ffffff;
            border-radius: 18px;
            padding: 40px 32px;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
            text-align: center;
            border: 1px solid #e2e8f0;
        }

        .icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 24px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 800;
        }

        .icon-success {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: #ffffff;
            box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
        }

        .icon-error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #ffffff;
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
        }

        h1 {
            font-size: 24px;
            margin-bottom: 12px;
            color: #0f172a;
        }

        p {
            color: #475569;
            line-height: 1.65;
            margin-bottom: 16px;
            font-size: 15.5px;
        }

        p.lead {
            color: #1e293b;
            font-size: 16.5px;
        }

        .brand-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            padding: 8px 18px;
            font-size: 13px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 24px;
        }

        .brand-chip .dot {
            width: 18px;
            height: 18px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #c01724, #e41d2e);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
        }

        .actions {
            margin-top: 28px;
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-block;
            padding: 13px 26px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: transform .15s ease, box-shadow .15s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, #c01724 0%, #e41d2e 100%);
            color: white !important;
            box-shadow: 0 6px 18px rgba(192, 23, 36, 0.25);
        }

        .btn-secondary {
            background: #f1f5f9;
            color: #0f172a !important;
            border: 1px solid #e2e8f0;
        }

        .btn:hover {
            transform: translateY(-1px);
        }

        small {
            color: #64748b;
            font-size: 13px;
        }

        @media (max-width: 480px) {
            .card {
                padding: 32px 20px;
            }

            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="brand-chip"><span class="dot">S</span> Sincery Prestations</div>
        @yield('status_content')
        <div class="actions">
            @yield('status_actions')
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px;">
        <small>Si vous rencontrez un problème, contactez-nous : contact@sincery-pres.com</small>
    </div>
</body>

</html>
