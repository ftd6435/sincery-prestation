@extends('emails.layouts.brand')

@section('title', 'Commande ' . $reference . ' — Statut : ' . $newStatusLabel)

@section('email_content')
    <h2>Bonjour {{ $customerName }},</h2>

    <p class="lead">
        Mise à jour de votre commande n° <strong>{{ $reference }}</strong>.
    </p>

    @php
        $alertType = match (true) {
            in_array($order->status, ['confirmed', 'delivered'], true) => 'alert-success',
            $order->status === 'canceled' => 'alert-warning',
            default => 'alert',
        };
        $alertIcon = match (true) {
            $order->status === 'confirmed' => '✅',
            $order->status === 'delivered' => '🚚',
            $order->status === 'canceled' => '⚠',
            default => 'ℹ',
        };
    @endphp

    <div class="alert {{ $alertType }}">
        {{ $alertIcon }} Votre commande est désormais : <strong style="font-size:1.05em;">{{ $newStatusLabel }}</strong>
        (mis à jour le {{ $statusDateFr }}).
    </div>

    @if ($customIntro)
        <p>{{ $customIntro }}</p>
    @elseif ($order->status === 'confirmed')
        <p>
            Votre commande a été <strong>validée par notre équipe commerciale</strong>.
            @if ($deliveryMode === 'Livraison')
                <strong>La livraison est en cours de préparation</strong> — notre transporteur vous contactera
                directement sur le téléphone enregistré pour convenir d'un rendez-vous.
            @else
                Votre commande est <strong>en préparation à la boutique</strong>. Un SMS vous sera envoyé
                dès qu'elle sera prête à être retirée à Nongo, Conakry.
            @endif
        </p>
    @elseif ($order->status === 'delivered')
        <p>
            Commande <strong>marquée comme livrée / retirée</strong>. Si vous n'avez pas reçu vos articles
            ou si le contenu ne correspond pas, répondez immédiatement à cet e-mail pour que nous
            intervenions.
        </p>
    @elseif ($order->status === 'canceled')
        <p>
            Votre commande a été <strong>annulée</strong>. Si cette annulation émane de nous, notre
            équipe commerciale vous contactera sous peu pour vous proposer une alternative. Si c'est
            votre souhait, nous restons à votre disposition pour toute nouvelle demande.
        </p>
    @endif

    <div class="info-card">
        <dl>
            <dt>Référence</dt>
            <dd><strong>{{ $reference }}</strong></dd>

            <dt>Statut actuel</dt>
            <dd><strong>{{ $newStatusLabel }}</strong></dd>

            <dt>Mis à jour le</dt>
            <dd>{{ $statusDateFr }}</dd>

            <dt>Mode de retrait</dt>
            <dd>{{ $deliveryMode }}</dd>

            <dt>Articles</dt>
            <dd>{{ $itemsCount }} article{{ $itemsCount > 1 ? 's' : '' }} —
                <strong>{{ number_format($subtotal, 0, ',', ' ') }} GNF</strong></dd>
        </dl>
    </div>

    <p>
        Une question sur votre commande ? <strong>Répondez directement à cet e-mail</strong>
        (votre conseiller est en copie), ou appelez-nous aux horaires d'ouverture.
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
            E-mail de suivi adressé à <strong>{{ $customerName }}</strong>
            ({{ $order->customer->email }}). Si vous avez reçu cet e-mail par erreur, merci de contacter
            Sincery Prestations.
        </p>
    </div>
@endsection
