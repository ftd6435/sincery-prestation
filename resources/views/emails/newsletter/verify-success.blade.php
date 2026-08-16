@extends('emails.newsletter.status-layout')

@section('title', 'Abonnement confirmé')

@section('status_content')
    <div class="icon icon-success">✓</div>
    <h1>Votre abonnement est confirmé !</h1>
    <p class="lead">Merci beaucoup, <strong>{{ $name ?? '' }}</strong>.</p>
    <p>
        Votre adresse <strong>{{ $email ?? '' }}</strong> a bien été vérifiée.
        Vous recevrez désormais nos actualités, nos nouveautés produits et nos
        offres exclusives directement dans votre boîte mail.
    </p>
@endsection

@section('status_actions')
    <a href="{{ url('/') }}" class="btn btn-primary">Retour à l'accueil</a>
    <a href="{{ url('/boutique') }}" class="btn btn-secondary">Découvrir la boutique</a>
@endsection
