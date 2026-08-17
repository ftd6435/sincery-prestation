@extends('quote-requests.layout')

@section('title', 'Devis ' . $quoteRequest->reference)

@php
    $statusLabel =
        [
            'new' => 'Nouveau',
            'pending' => 'En cours de traitement',
            'sent' => 'Envoyé au client',
            'approved' => 'Approuvé',
            'rejected' => 'Rejeté',
        ][$quoteRequest->status] ?? $quoteRequest->status;
    $statusClass = 'status-' . $quoteRequest->status;
    $isEditable = $quoteRequest->status === 'sent';
@endphp

@section('content')
    <div class="card-header">
        <div>
            <h2>Proposition chiffrée</h2>
            <div class="dates">
                Date d'émission : <strong>{{ $issueDateFr }}</strong> &nbsp;·&nbsp;
                Valable jusqu'au : <strong style="color: #c01724;">{{ $validityDateFr }}</strong>
            </div>
        </div>
        <div>
            <span class="status-badge {{ $statusClass }}">{{ $statusLabel }}</span>
        </div>
    </div>

    <div class="two-col">
        <div class="col-block">
            <h3>Sincery Prestations</h3>
            <p class="name comp">{{ $company['name'] }}</p>
            <p>{{ $company['address'] }}</p>
            <p>Téléphone : <a href="tel:{{ preg_replace('/\s+/u', '', $company['phone']) }}">{{ $company['phone'] }}</a></p>
            <p>Email : <a href="mailto:{{ $company['email'] }}">{{ $company['email'] }}</a></p>
        </div>
        <div class="col-block">
            <h3>Client</h3>
            <p class="name cust">{{ $quoteRequest->customer->full_name }}</p>
            @if ($quoteRequest->customer->company_name)
                <p>{{ $quoteRequest->customer->company_name }}</p>
            @endif
            <p>{{ $quoteRequest->customer->address }}</p>
            @if ($quoteRequest->customer->city || $quoteRequest->customer->country)
                <p>{{ trim(($quoteRequest->customer->city ?? '') . ' — ' . ($quoteRequest->customer->country ?? ''), ' —') }}
                </p>
            @endif
            <p>Téléphone : <a
                    href="tel:{{ preg_replace('/\s+/u', '', $quoteRequest->customer->phone) }}">{{ $quoteRequest->customer->phone }}</a>
            </p>
            <p>Email : <a href="mailto:{{ $quoteRequest->customer->email }}">{{ $quoteRequest->customer->email }}</a></p>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th class="num" style="width: 5%;">#</th>
                <th>Désignation</th>
                <th class="qty" style="width: 9%;">Qté</th>
                <th style="width: 12%;">Unité</th>
                <th class="price" style="width: 15%;">PU (GNF)</th>
                <th class="total" style="width: 16%;">Total (GNF)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $i => $item)
                <tr>
                    <td class="num">{{ $i + 1 }}</td>
                    <td>
                        <div class="p-name">{{ $item->product_name_snapshot }}</div>
                    </td>
                    <td class="qty">{{ number_format($item->quantity, 0, ',', ' ') }}</td>
                    <td>{{ $item->product_unit_snapshot }}</td>
                    <td class="price">{{ number_format((float) $item->price_snapshot, 0, ',', ' ') }}</td>
                    <td class="total"><strong>{{ number_format((float) $item->total_price, 0, ',', ' ') }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals-wrap">
        <div class="totals">
            <div class="row">
                <span class="label">Sous-total ({{ $itemsCount }} article{{ $itemsCount > 1 ? 's' : '' }})</span>
                <span class="value">{{ number_format($subtotal, 0, ',', ' ') }} GNF</span>
            </div>
            <div class="row">
                <span class="label">Remise</span>
                <span class="value">—</span>
            </div>
            <div class="row">
                <span class="label">Livraison</span>
                <span class="value">Sur devis</span>
            </div>
            <div class="row grand">
                <span class="label">Total TTC</span>
                <span class="value">{{ number_format($subtotal, 0, ',', ' ') }} GNF</span>
            </div>
        </div>
    </div>

    <div class="notes">
        <h4>⚠ Conditions de validité</h4>
        <ul>
            <li>Ce devis est valable jusqu'au <strong>{{ $validityDateFr }}</strong> inclus.</li>
            <li>Pour finaliser votre commande : cliquez sur <strong>« Approuver ce devis »</strong> ci-dessous. Votre
                approbation vaut accord préalable.</li>
            <li>Pour toute modification de quantité, article ou question sur les modalités de paiement / livraison :
                contactez votre conseiller au <strong>{{ $company['phone'] }}</strong>.</li>
            <li>Prix exprimés en Franc Guinéen (GNF), hors frais de livraison, sauf mention contraire.</li>
            <li>Les commandes sont fermes après signature d'un bon de commande et versement d'acompte.</li>
        </ul>
    </div>

    @if (!empty($quoteRequest->comment))
        <div class="customer-comment">
            <h4>📝 Votre remarque (lors de la demande)</h4>
            <p>{{ $quoteRequest->comment }}</p>
        </div>
    @endif

    <div class="actions-box">
        <div class="text">
            <h3>
                @if ($isEditable)
                    Vous pouvez maintenant approuver ou rejeter ce devis.
                @else
                    Statut final.
                @endif
            </h3>
            @if ($isEditable)
                <p>Une fois approuvé, notre équipe commerciale prendra contact avec vous sous 24 h ouvrées pour finaliser la
                    commande. Vous pouvez à tout moment revenir sur cette page via le lien signé reçu par e-mail ou en
                    scannant le QR code du PDF.</p>
            @elseif ($quoteRequest->status === 'approved')
                <p>✅ Merci d'avoir approuvé ce devis ! Notre équipe prend contact avec vous très vite.</p>
            @elseif ($quoteRequest->status === 'rejected')
                <p>❌ Ce devis a été rejeté. N'hésitez pas à contacter notre équipe pour une nouvelle proposition adaptée.
                </p>
            @else
                <p>Le statut actuel de ce devis est "{{ $statusLabel }}". Il ne peut plus être modifié depuis cette page.
                </p>
            @endif
        </div>
        @if ($isEditable)
            <div class="buttons">
                <form method="POST"
                    action="{{ URL::temporarySignedRoute('quote-requests.public.reject', now()->addDays(60), ['reference' => $quoteRequest->reference]) }}">
                    @csrf
                    <button type="submit" class="btn btn-reject"
                        onclick="return confirm('Êtes-vous certain·e de vouloir rejeter ce devis ? Cette action est définitive.')">
                        ✕ Rejeter
                    </button>
                </form>
                <form method="POST"
                    action="{{ URL::temporarySignedRoute('quote-requests.public.approve', now()->addDays(60), ['reference' => $quoteRequest->reference]) }}">
                    @csrf
                    <button type="submit" class="btn btn-approve"
                        onclick="return confirm('En approuvant vous confirmez avoir lu toutes les conditions (prix, validité, livraison) et vous donnez votre accord préalable. Confirmer ?')">
                        ✓ Approuver ce devis
                    </button>
                </form>
            </div>
        @else
            <div class="buttons">
                <a href="{{ url('/') }}" class="btn btn-reject" style="border-color: #cbd5e1; color: #334155;">Retour
                    à l'accueil</a>
            </div>
        @endif
    </div>
@endsection
