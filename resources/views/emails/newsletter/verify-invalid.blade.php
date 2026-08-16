@extends('emails.newsletter.status-layout')

@section('title', 'Lien invalide')

@section('status_content')
    <div class="icon icon-error">?</div>
    <h1>Ce lien de confirmation n'existe plus</h1>
    <p class="lead">Il a peut-être déjà été utilisé, ou il correspond à un abonnement supprimé.</p>
    <p>
        Si vous souhaitez recevoir nos actualités, vous pouvez remplir à nouveau le
        formulaire d'inscription en bas de notre page d'accueil. Un nouveau lien
        vous sera envoyé par e-mail.
    </p>
@endsection

@section('status_actions')
    <a href="{{ url('/') }}#newsletter" class="btn btn-primary">S'abonner à la newsletter</a>
    <a href="{{ url('/') }}" class="btn btn-secondary">Retour à l'accueil</a>
@endsection
