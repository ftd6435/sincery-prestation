@extends('emails.layouts.brand')

@section('title', 'Devis ' . $reference . ' — Sincery Prestations')

@section('email_content')
    <h2>Bonjour {{ $customerName }},</h2>

    <p class="lead">
        Nous vous remercions pour votre confiance et votre demande de devis n°
        <strong>{{ $reference }}</strong>.
    </p>

    <div class="alert alert-success">
        ✅ Votre <strong>proposition chiffrée</strong> est prête et
        <strong>jointe à cet e-mail en fichier PDF</strong>
        ({{ $itemsCount }} article{{ $itemsCount > 1 ? 's' : '' }},
        Total TTC :
        <strong>{{ number_format($subtotal, 0, ',', ' ') }} GNF</strong>).
    </div>

    <p>
        Vous trouverez ci-joint l'intégralité du devis : désignations,
        quantités, prix unitaires, totaux, ainsi que nos conditions et
        coordonnées. Un <strong>QR code unique</strong> figure également sur
        la dernière page du PDF pour accéder rapidement à la version en ligne.
    </p>

    <div style="text-align: center; margin: 10px 0;">
        <a href="{{ $viewQuoteUrl }}" class="btn-primary" target="_blank" rel="noopener">
            Voir le devis en ligne
        </a>
    </div>

    <div class="alert alert-warning">
        <strong>⚠ Validité :</strong> Pour être pris en compte,
        <strong>ce devis doit être approuvé ou rejeté au plus tard le
            {{ $validityDateFr }}</strong>. Passé cette date les prix et la
        disponibilité des articles ne sont plus garantis.
    </div>

    <div class="info-card">
        <dl>
            <dt>Référence</dt>
            <dd><strong>{{ $reference }}</strong></dd>

            <dt>Date d'émission</dt>
            <dd>{{ $issueDateFr ?? \Carbon\Carbon::now()->locale('fr_FR')->isoFormat('D MMMM YYYY') }}</dd>

            <dt>Date limite de validité</dt>
            <dd><strong>{{ $validityDateFr }}</strong></dd>

            <dt>Mode de contact préféré</dt>
            <dd>{{ $preferedContact === 'telephone' ? 'Téléphone' : ($preferedContact === 'whatsapp' ? 'WhatsApp' : 'E-mail') }}
            </dd>
        </dl>
    </div>

    <p>
        Si vous souhaitez <strong>approuver ce devis</strong>, cliquez sur le
        bouton ci-dessus (ou scannez le QR code du PDF) et sélectionnez
        « Approuver ». Vous pouvez également répondre directement à cet e-mail
        ou nous appeler pour échanger avec un conseiller.
    </p>

    <p>
        Si vous souhaitez <strong>modifier un article, ajuster une quantité
            ou discuter des modalités de paiement / livraison</strong>, n'hésitez
        pas à contacter notre équipe commerciale — nous nous ferons un plaisir
        d'ajuster la proposition à vos besoins.
    </p>

    <div class="divider"></div>

    <p class="signature">
        Bien à vous,<br>
        L'équipe <strong>Sincery Prestations</strong><br>
        <span style="font-size: 13px; color: #64748b; font-weight: 400;">
            Tél. +224 622 14 67 14 &nbsp;·&nbsp; contact@sincery-pres.com
        </span>
    </p>
@endsection

@section('footer_extra')
    <div style="margin-top: 10px; opacity: 0.85;">
        <p>
            E-mail adressé à <strong>{{ $customerName }}</strong>
            ({{ $quoteRequest->customer->email }}). Si vous n'êtes pas à
            l'origine de cette demande de devis, merci de contacter immédiatement
            notre équipe commerciale.
        </p>
    </div>
@endsection
