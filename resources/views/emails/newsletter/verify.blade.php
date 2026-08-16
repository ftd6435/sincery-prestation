@extends('emails.layouts.brand')

@section('title', 'Confirmez votre abonnement — Sincery Prestations')

@section('email_content')
    <h2>Bonjour {{ $name }},</h2>

    <p class="lead">Merci pour votre abonnement à notre newsletter !</p>

    <p>
        Pour valider votre inscription et commencer à recevoir nos actualités
        (nouveautés produits, offres exclusives, conseils professionnels),
        merci de confirmer votre adresse e-mail en cliquant sur le bouton
        ci-dessous :
    </p>

    <div style="text-align: center;">
        <a href="{{ $verifyUrl }}" class="btn-primary" target="_blank" rel="noopener">
            Confirmer mon abonnement
        </a>
    </div>

    <div class="alert alert-warning">
        <strong>Important :</strong> Ce lien de confirmation est valable
        <strong>48 heures</strong>. Passé ce délai, il expirera et il vous
        faudra vous réinscrire.
    </div>

    <p>
        Si le bouton ci-dessus ne fonctionne pas, copiez-collez l'adresse
        suivante dans votre navigateur :
    </p>

    <div class="info-card" style="word-break: break-all; font-size: 13px; color: #475569;">
        {{ $verifyUrl }}
    </div>

    <p>
        Si vous n'êtes pas à l'origine de cette inscription, vous pouvez
        ignorer cet e-mail : votre adresse ne sera jamais ajoutée à notre
        liste sans confirmation.
    </p>

    <div class="divider"></div>

    <p class="signature">
        Bien à vous,<br>
        L'équipe <strong>Sincery Prestations</strong>
    </p>
@endsection

@section('footer_extra')
    <div style="margin-top: 10px; opacity: 0.85;">
        <p>
            Cet e-mail a été envoyé à <strong>{{ $email }}</strong> suite à
            une demande d'abonnement sur notre site.
        </p>
    </div>
@endsection
