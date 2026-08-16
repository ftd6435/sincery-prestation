@extends('emails.newsletter.status-layout')

@section('title', 'Lien expiré')

@section('status_content')
    <div class="icon icon-error">!</div>
    <h1>Ce lien de confirmation a expiré</h1>
    <p class="lead">Les liens de validation sont valables 48 heures après inscription.</p>
    <p>
        Pas d'inquiétude ! Pour confirmer votre abonnement, vous pouvez simplement
        vous réinscrire via le formulaire newsletter situé en bas de notre site.
        Une nouvelle demande vous enverra un lien de confirmation frais.
    </p>
    <p>
        Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter
        directement.
    </p>
@endsection

@section('status_actions')
    <a href="{{ url('/') }}#newsletter" class="btn btn-primary">Réinscription newsletter</a>
    <a href="{{ url('/contact') }}" class="btn btn-secondary">Nous contacter</a>
@endsection
