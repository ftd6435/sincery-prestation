@extends('emails.layouts.brand')

@section('title', 'Nouveau message — Sincery Prestations')

@section('email_content')
    <h2>🔔 Nouveau message reçu</h2>

    <p class="lead">
        Un visiteur a envoyé un message via le formulaire de contact du site.
    </p>

    <div class="info-card">
        <dl>
            <dt>Nom complet</dt>
            <dd>{{ $contact->name }}</dd>

            <dt>Adresse e-mail</dt>
            <dd><a href="mailto:{{ $contact->email }}">{{ $contact->email }}</a></dd>

            <dt>Téléphone</dt>
            <dd>
                @if ($contact->phone)
                    <a href="tel:{{ preg_replace('/\s+/', '', $contact->phone) }}">{{ $contact->phone }}</a>
                @else
                    —
                @endif
            </dd>

            <dt>Sujet</dt>
            <dd><strong>{{ $contact->subject }}</strong></dd>

            <dt>Date</dt>
            <dd>{{ $contact->created_at?->setTimezone('Africa/Conakry')->format('d/m/Y à H:i') ?? now()->format('d/m/Y à H:i') }}
            </dd>

            <dt>Message</dt>
            <dd class="message-body">{{ $contact->message }}</dd>
        </dl>
    </div>

    <div class="divider"></div>

    <p>
        <strong>Pour répondre :</strong> utilisez le bouton « Répondre » de
        votre client mail — l'expéditeur sera automatiquement défini sur
        <em>{{ $contact->email }}</em> (champ Reply-To configuré).
    </p>
@endsection

@section('footer_extra')
    <div style="margin-top: 10px; opacity: 0.85;">
        <p>
            Ceci est un e-mail automatique envoyé par le site
            <strong>Sincery Prestations</strong>. Merci de ne pas y répondre
            directement — utilisez l'adresse e-mail du visiteur.
        </p>
    </div>
@endsection
