<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', 'Sincery Prestations')</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f7f7f8;
            color: #0f172a;
            line-height: 1.6;
            font-size: 16px;
        }

        .email-wrapper {
            width: 100%;
            background-color: #f7f7f8;
            padding: 32px 16px;
        }

        .email-body {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
            border: 1px solid #e2e8f0;
        }

        .email-header {
            background: linear-gradient(135deg, #c01724 0%, #e41d2e 100%);
            padding: 24px 32px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .email-logo-badge {
            width: 40px;
            height: 40px;
            border-radius: 9999px;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            color: #c01724;
            font-size: 18px;
            flex-shrink: 0;
        }

        .email-header-titles {
            color: #ffffff;
        }

        .email-header-titles h1 {
            font-size: 18px;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
        }

        .email-header-titles p {
            font-size: 12px;
            opacity: 0.85;
            margin: 2px 0 0 0;
        }

        .email-content {
            padding: 32px;
        }

        .email-content h2 {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 16px;
            line-height: 1.3;
        }

        .email-content p {
            margin-bottom: 16px;
            color: #334155;
        }

        .email-content p.lead {
            font-size: 17px;
            color: #0f172a;
            font-weight: 500;
        }

        .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #c01724 0%, #e41d2e 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            padding: 14px 32px;
            border-radius: 10px;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 6px 18px rgba(192, 23, 36, 0.25);
            transition: transform .15s ease;
            mso-padding-alt: 0;
            mso-text-raise: 0;
            text-underline: none;
        }

        .btn-secondary {
            display: inline-block;
            background: #f1f5f9;
            color: #0f172a !important;
            text-decoration: none;
            font-weight: 500;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            margin: 16px 0;
            border: 1px solid #e2e8f0;
        }

        .info-card {
            background: #f8fafc;
            border-left: 4px solid #c01724;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }

        .info-card dl {
            display: grid;
            grid-template-columns: 130px 1fr;
            gap: 8px 16px;
            margin: 0;
        }

        .info-card dt {
            color: #64748b;
            font-size: 14px;
            font-weight: 500;
        }

        .info-card dd {
            color: #0f172a;
            font-size: 14px;
            margin: 0;
            word-break: break-word;
        }

        .info-card dd.message-body {
            grid-column: 1 / -1;
            background: #ffffff;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            white-space: pre-wrap;
            color: #1e293b;
            font-size: 14.5px;
            margin-top: 6px;
        }

        .alert {
            padding: 14px 18px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 14.5px;
        }

        .alert-warning {
            background: #fffbeb;
            color: #92400e;
            border: 1px solid #fde68a;
        }

        .alert-success {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
        }

        .email-footer {
            padding: 24px 32px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 13px;
            line-height: 1.7;
        }

        .email-footer strong {
            color: #0f172a;
        }

        .email-footer a {
            color: #c01724;
            text-decoration: none;
            font-weight: 500;
        }

        .footer-contact {
            margin-top: 8px;
        }

        .signature {
            color: #475569;
            font-size: 15px;
            margin-top: 12px;
        }

        .signature strong {
            color: #c01724;
        }

        @media only screen and (max-width: 480px) {
            .email-wrapper {
                padding: 16px 8px;
            }

            .email-content {
                padding: 24px;
            }

            .email-header {
                padding: 20px;
            }

            .email-footer {
                padding: 20px 24px;
            }

            .info-card dl {
                grid-template-columns: 1fr;
                gap: 2px;
            }

            .info-card dt {
                margin-top: 8px;
            }

            .info-card dd.message-body {
                margin-top: 4px;
            }

            h2 {
                font-size: 20px !important;
            }

            .btn-primary {
                display: block !important;
                text-align: center;
            }
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="email-body">

            <div class="email-header">
                <div class="email-logo-badge">S</div>
                <div class="email-header-titles">
                    <h1>Sincery Prestations</h1>
                    <p>Équipements professionnels — EPI, sécurité, engins, matériel</p>
                </div>
            </div>

            <div class="email-content">
                @yield('email_content')
            </div>

            <div class="email-footer">
                <div>
                    <strong>Sincery Prestations</strong>
                </div>
                <div class="footer-contact">
                    Téléphone : <a href="tel:+224622000000">+224 622 00 00 00</a><br>
                    Email : <a href="mailto:contact@sincery-pres.com">contact@sincery-pres.com</a><br>
                    Conakry, Guinée
                </div>
                @yield('footer_extra')
            </div>

        </div>
    </div>
</body>

</html>
