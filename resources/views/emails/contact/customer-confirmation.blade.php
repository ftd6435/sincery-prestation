@extends('emails.layouts.brand')

@section('title', 'Accusé de réception — Sincery Prestations')

@section('email_content')
    <h2>Bonjour {{ $contact->name }},</h2>

    <p class="lead">Merci de nous avoir contactés !</p>

    <div class="alert alert-success">
        ✅ Votre message a bien été reçu par notre équipe.
    </div>

    <p>
        Nous accusons bonne réception de votre demande. Un membre de notre
        équipe commerciale prendra contact avec vous
        <strong>dans les plus brefs délais</strong> (généralement sous 24 à
        48 heures ouvrées).
    </p>

    <div class="divider"></div>

    <h3 style="font-size: 17px; margin-bottom: 12px; color: #0f172a;">
        Rappel de votre demande :
    </h3>

    <div class="info-card">
        <dl>
            <dt>Sujet</dt>
            <dd><strong>{{ $contact->subject }}</strong></dd>

            @if ($contact->phone)
                <dt>Téléphone</dt>
                <dd>{{ $contact->phone }}</dd>
            @endif

            <dt>Votre message</dt>
            <dd class="message-body">{{ $contact->message }}</dd>
        </dl>
    </div>

    <div class="divider"></div>

    <p>
        Si vous avez des informations complémentaires à nous transmettre
        d'ici là, n'hésitez pas à contacter directement :
    </p>

    <div class="info-card">
        <dl>
            <dt>Téléphone</dt>
            <dd><a href="tel:+224622000000">+224 622 00 00 00</a></dd>
            <dt>Email</dt>
            <dd><a href="mailto:contact@sincery-pres.com">contact@sincery-pres.com</a></dd>
        </dl>
    </div>

    <p class="signature">
        Bien à vous,<br>
        L'équipe commerciale <strong>Sincery Prestations</strong>
    </p>
@endsection

@section('footer_extra')
    <div style="margin-top: 10px; opacity: 0.85;">
        <p>
            Cet accusé de réception automatique a été envoyé à
            <strong>{{ $contact->email }}</strong>.
        </p>
    </div>
@endsection
