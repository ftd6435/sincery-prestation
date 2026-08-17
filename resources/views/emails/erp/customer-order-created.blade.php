@extends('emails.layouts.brand')

@section('title', 'Commande ' . $reference . ' — Sincery Prestations')

@section('email_content')
    <h2>Bonjour {{ $customerName }},</h2>

    <p class="lead">
        Merci pour votre commande ! Nous avons bien enregistré la commande n°
        <strong>{{ $reference }}</strong>.
    </p>

    <div class="alert alert-success">
        ✅ Commande enregistrée avec succès. Notre équipe <strong>traite votre demande sous 24 h ouvrées</strong>
        et vous recontactera sur votre moyen de contact préféré.
    </div>

    <div class="info-card">
        <dl>
            <dt>Référence</dt>
            <dd><strong>{{ $reference }}</strong></dd>

            <dt>Date</dt>
            <dd>{{ $createdDateFr }}</dd>

            <dt>Mode de retrait</dt>
            <dd>{{ $deliveryMode }}</dd>

            @if ($deliveryAddress)
                <dt>Adresse de livraison</dt>
                <dd>{{ $deliveryAddress }}</dd>
            @endif

            <dt>Nombre d'articles</dt>
            <dd>{{ $itemsCount }} article{{ $itemsCount > 1 ? 's' : '' }}</dd>

            <dt>Total TTC (estimatif)</dt>
            <dd><strong>{{ number_format($subtotal, 0, ',', ' ') }} GNF</strong></dd>
        </dl>
    </div>

    <div class="alert alert-warning">
        <strong>⚠ À noter :</strong>
        @if ($deliveryMode === 'Livraison')
            Les frais de livraison ne sont pas encore inclus. Ils vous seront confirmés lors de la validation
            définitive par votre conseiller.
        @else
            Vous recevrez un message dès que votre commande sera prête à être retirée à notre boutique
            de Nongo, Conakry.
        @endif
    </div>

    <p>
        Pour <strong>toute modification</strong> (article, quantité, adresse, mode de livraison),
        répondez directement à cet e-mail ou appelez-nous — il est encore temps d'ajuster.
    </p>

    <div style="text-align: center; margin: 10px 0;">
        <a href="{{ url('/') }}" class="btn-primary" target="_blank" rel="noopener">
            Continuer ma navigation
        </a>
    </div>

    <div class="divider"></div>

    <p class="signature">
        Merci pour votre confiance,<br>
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
            ({{ $order->customer->email }}). Si vous n'êtes pas à l'origine de cette commande,
            merci de contacter immédiatement notre équipe commerciale.
        </p>
    </div>
@endsection
