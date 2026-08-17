@extends('quote-requests.layout')

@section('title', $type === 'approved' ? 'Devis approuvé' : 'Devis rejeté')

@section('content')
    <div class="card-header" style="border-bottom: 2px solid {{ $type === 'approved' ? '#16a34a' : '#991b1b' }};">
        <div>
            <h2 style="color: {{ $type === 'approved' ? '#16a34a' : '#991b1b' }};">
                {{ $type === 'approved' ? '✅ Devis approuvé' : '❌ Devis rejeté' }}
            </h2>
            <div class="dates">
                Action enregistrée le <strong>{{ now()->locale('fr_FR')->isoFormat('D MMMM YYYY [à] HH[h]mm') }}</strong>
            </div>
        </div>
        <div>
            <span class="status-badge {{ $type === 'approved' ? 'status-approved' : 'status-rejected' }}">
                {{ $type === 'approved' ? 'Approuvé' : 'Rejeté' }}
            </span>
        </div>
    </div>

    <div style="padding: 18px 0; text-align: center;">
        <div
            style="width: 72px; height: 72px; margin: 0 auto 18px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #fff; background: linear-gradient(135deg, {{ $type === 'approved' ? '#16a34a, #22c55e' : '#991b1b, #dc2626' }}); box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);">
            {{ $type === 'approved' ? '✓' : '✕' }}
        </div>

        <h3 style="font-size: 22px; margin-bottom: 10px; color: #0f172a;">
            {{ $type === 'approved' ? 'Merci pour votre confiance !' : 'Demande prise en compte' }}
        </h3>
        <p style="color: #475569; max-width: 620px; margin: 0 auto; line-height: 1.7; font-size: 15px;">
            @if ($type === 'approved')
                L'approbation du devis <strong>{{ $quoteRequest->reference }}</strong> a bien été enregistrée.
                Notre équipe commerciale <strong>vous contacte sous 24 h ouvrées</strong> (téléphone ou e-mail selon vos
                préférences)
                pour finaliser votre commande (modalités de paiement, planning de livraison, bon de commande signé).
            @else
                Le devis <strong>{{ $quoteRequest->reference }}</strong> a bien été marqué comme rejeté.
                Si c'est une erreur, ou si vous souhaitez une nouvelle proposition adaptée à vos besoins,
                contactez-nous sans hésiter — nous nous ferons un plaisir d'ajuster la proposition.
            @endif
        </p>
    </div>

    <div class="notes" style="background: #f8fafc; border-left-color: #c01724; border-color: #e2e8f0;">
        <h4 style="color: #c01724;">📞 Contact Sincery Prestations</h4>
        <ul style="list-style: none; padding: 0;">
            <li style="color: #0f172a; margin: 6px 0;">
                <strong>Téléphone / WhatsApp :</strong>
                <a href="tel:{{ preg_replace('/\s+/u', '', $company['phone']) }}">{{ $company['phone'] }}</a>
            </li>
            <li style="color: #0f172a; margin: 6px 0;">
                <strong>Email :</strong>
                <a href="mailto:{{ $company['email'] }}">{{ $company['email'] }}</a>
            </li>
            <li style="color: #0f172a; margin: 6px 0;">
                <strong>Adresse :</strong> {{ $company['address'] }}
            </li>
            <li style="color: #0f172a; margin: 6px 0;">
                <strong>Horaires :</strong> Lundi–Vendredi 08h–18h · Samedi 09h–13h
            </li>
        </ul>
    </div>

    <div class="actions-box">
        <div class="text">
            <h3>Autres actions</h3>
            <p>Continuez votre navigation sur le site Sincery Prestations.</p>
        </div>
        <div class="buttons">
            <a href="{{ url('/contact') }}" class="btn btn-reject" style="border-color: #94a3b8; color: #0f172a;">Contacter
                l'équipe</a>
            <a href="{{ url('/') }}" class="btn btn-approve"
                style="background: linear-gradient(135deg, #c01724, #e41d2e);">Retour à l'accueil</a>
        </div>
    </div>
@endsection
