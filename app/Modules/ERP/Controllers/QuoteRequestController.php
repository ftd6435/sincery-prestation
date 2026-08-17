<?php

namespace App\Modules\ERP\Controllers;

use App\Events\SendMessageEvent;
use App\Http\Controllers\Controller;
use App\Modules\Administration\Models\User;
use App\Modules\ERP\Mail\QuoteRequestPriced;
use App\Modules\ERP\Models\Customer;
use App\Modules\ERP\Models\QuoteRequest;
use App\Modules\ERP\Requests\QuoteRequestRequest;
use App\Modules\ERP\Requests\QuoteRequestPricingRequest;
use App\Modules\ERP\Resources\QuoteRequestResource;
use App\Modules\Management\Models\Product;
use App\Modules\Settings\Models\Setting;
use App\Traits\ApiResponses;
use Carbon\Carbon;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QuoteRequestController extends Controller
{
    use ApiResponses;

    private static function company(): array
    {
        return Setting::getCompanySettings();
    }

    public function index()
    {
        $quoteRequests = QuoteRequest::with('customer')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(
            QuoteRequestResource::collection($quoteRequests),
            "Demandes de devis chargées avec succès"
        );
    }

    public function show(QuoteRequest $quoteRequest)
    {
        // Admin opening a fresh request marks it as being handled
        if ($quoteRequest->status === 'new') {
            $quoteRequest->update(['status' => 'pending']);
        }

        return $this->successResponse(
            new QuoteRequestResource($quoteRequest->load(['customer', 'items'])),
            "Demande de devis chargée avec succès"
        );
    }

    public function store(QuoteRequestRequest $request)
    {
        $data = $request->validated();

        $quoteRequest = DB::transaction(function () use ($data, $request) {
            $customer = $request->matchedCustomer();

            if (!$customer) {
                $customer = Customer::create([
                    'full_name' => $data['full_name'],
                    'company_name' => $data['company_name'] ?? null,
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                ]);
            }

            $quoteRequest = QuoteRequest::create([
                'reference' => $this->generateReference(),
                'customer_id' => $customer->id,
                'status' => 'new',
                'prefered_contact' => $data['prefered_contact'] ?? 'telephone',
                'comment' => $data['comment'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];
                $priceSnapshot = $product->price ?? 0;

                $quoteRequest->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'product_name_snapshot' => $product->name,
                    'product_unit_snapshot' => $product->unit,
                    'price_snapshot' => $priceSnapshot,
                    'total_price' => round($priceSnapshot * $quantity, 2),
                ]);
            }

            if ($quoteRequest) {
                SendMessageEvent::dispatch($customer->phone, "Votre demande de devis {$quoteRequest->reference} a été créée avec succès.\n\nSincery Prestations");
            }

            return $quoteRequest;
        });


        return $this->successResponse(
            new QuoteRequestResource($quoteRequest->load(['customer', 'items'])),
            "Demande de devis créée avec succès"
        );
    }

    /**
     * Admin sets final prices for every item + a validity date, then the
     * quote auto-transitions to 'sent'. Only allowed from 'pending' or 'sent'.
     *
     * Actions implémentées :
     *  • Génération d'un PDF professionnel (charte graphique Sincery) avec
     *    logo, en-tête société/client, tableau des articles, totaux, note
     *    de validité, et un QR code unique renvoyant vers la page publique
     *    du devis (signée, non altérable, liée à la référence).
     *  • Envoi d'un e-mail au client (en copie à l'équipe commerciale) avec
     *    le PDF joint et un bouton d'accès à la page en ligne. L'e-mail
     *    rappelle la date de validité et invite à approuver / contacter.
     *  • Les envois sont systématiquement passés en Queue pour ne pas
     *    bloquer la réponse HTTP. Échec SMTP ⇒ rapporté dans les logs +
     *    retour JSON signalant l'erreur sans faire échouer le save.
     */
    public function setPricing(QuoteRequestPricingRequest $request, QuoteRequest $quoteRequest)
    {
        if ($quoteRequest->status == 'approved') {
            return $this->errorResponse("Vous ne pouvez pas tarifier un devis déjà approuvé", 422);
        }

        $data = $request->validated();

        // Every existing item must be priced — partial pricing isn't allowed
        $submittedIds = collect($data['items'])->pluck('id')->sort()->values();
        $existingIds = $quoteRequest->items()->pluck('id')->sort()->values();

        if ($submittedIds->diff($existingIds)->isNotEmpty() || $existingIds->diff($submittedIds)->isNotEmpty()) {
            return $this->errorResponse("Le prix de tous les articles doit être renseigné", 422);
        }

        $emailSent = false;
        $emailErrorMessage = null;
        $pdfGenerated = false;
        $pdfErrorMessage = null;
        $viewQuoteUrl = null;
        $validityDateFr = null;
        $issueDateFr = null;
        $storagePdfRelativePath = null;
        $pdfFileName = null;

        DB::transaction(function () use ($quoteRequest, $data, &$emailSent, &$emailErrorMessage, &$pdfGenerated, &$pdfErrorMessage, &$viewQuoteUrl, &$validityDateFr, &$issueDateFr, &$storagePdfRelativePath, &$pdfFileName) {
            foreach ($data['items'] as $itemData) {
                $item = $quoteRequest->items()->find($itemData['id']);
                $item->update([
                    'price_snapshot' => $itemData['price'],
                    'quantity' => $itemData['quantity'],
                    'total_price' => round($itemData['price'] * $itemData['quantity'], 2),
                ]);
            }

            $quoteRequest->update([
                'validity_date' => $data['validity_date'],
                'status' => 'sent',
            ]);

            // —— Préparations mail / PDF (les relations sont fraîches après update) ——
            $quoteRequest->load(['customer', 'items']);

            $company = self::company();
            $validityCarbon = Carbon::parse($quoteRequest->validity_date);
            $issueCarbon = now();
            $validityDateFr = $validityCarbon->locale('fr_FR')->isoFormat('D MMMM YYYY');
            $issueDateFr = $issueCarbon->locale('fr_FR')->isoFormat('D MMMM YYYY');

            // Page publique cliente (QR code + bouton mail) → URL signée 60j
            try {
                $viewQuoteUrl = URL::temporarySignedRoute(
                    'quote-requests.public.show',
                    now()->addDays(60),
                    ['reference' => $quoteRequest->reference],
                );
            } catch (\Throwable $e) {
                // Fallback si la route n'est pas encore déclarée côté web
                $viewQuoteUrl = url('/devis/' . $quoteRequest->reference);
            }

            // —— Génération du PDF ——
            try {
                $items = $quoteRequest->items;
                $subtotal = (float) $items->sum('total_price');
                $itemsCount = $items->count();

                // Génération du QR code SVG (inline dans le HTML du PDF)
                $qrCodeSvg = QrCode::format('svg')
                    ->size(240)
                    ->errorCorrection('M')
                    ->margin(2)
                    ->generate($viewQuoteUrl);

                $html = view('pdf.quote-request', [
                    'quoteRequest' => $quoteRequest,
                    'company' => $company,
                    'items' => $items,
                    'itemsCount' => $itemsCount,
                    'subtotal' => $subtotal,
                    'issueDateFr' => $issueDateFr,
                    'validityDateFr' => $validityDateFr,
                    'viewQuoteUrl' => $viewQuoteUrl,
                    'qrCodeSvg' => $qrCodeSvg,
                ])->render();

                $options = new Options();
                $options->set('isHtml5ParserEnabled', true);
                $options->set('isRemoteEnabled', true);
                $options->set('isPhpEnabled', false);
                $options->set('defaultFont', 'Helvetica');
                $options->set('chroot', public_path());

                $dompdf = new Dompdf($options);
                $dompdf->setPaper('A4', 'portrait');
                $dompdf->loadHtml($html, 'UTF-8');
                $dompdf->render();

                $pdfRaw = $dompdf->output();

                // Stockage sur le disque 'local' pour pouvoir l'attacher via Mailable
                $pdfFileName = "devis-{$quoteRequest->reference}-" . time() . '.pdf';
                $storagePdfRelativePath = 'quotes/' . $pdfFileName;
                $disk = \Illuminate\Support\Facades\Storage::disk('local');
                $disk->put($storagePdfRelativePath, $pdfRaw);
                $pdfGenerated = true;
            } catch (\Throwable $pdfError) {
                report($pdfError);
                $pdfErrorMessage = $pdfError->getMessage();
                $pdfGenerated = false;
            }

            // —— Envoi du mail (PDF joint + corps) ——
            if ($pdfGenerated && $storagePdfRelativePath && $pdfFileName) {
                try {
                    Mail::to($quoteRequest->customer->email, $quoteRequest->customer->full_name)
                        ->queue(new QuoteRequestPriced(
                            $quoteRequest,
                            $validityDateFr,
                            $issueDateFr,
                            $viewQuoteUrl,
                            $storagePdfRelativePath,
                            $pdfFileName,
                        ));
                    $emailSent = true;
                } catch (\Throwable $mailError) {
                    report($mailError);
                    $emailSent = false;
                    $emailErrorMessage = $mailError->getMessage();
                }
            }

            // —— SMS de notification au client ——
            try {
                SendMessageEvent::dispatch(
                    $quoteRequest->customer->phone,
                    "Bonjour {$quoteRequest->customer->full_name}, votre devis {$quoteRequest->reference} est prêt ! Consultez-le et approuvez-le depuis le lien envoyé par e-mail, ou scannez le QR code du PDF joint. Valable jusqu'au {$validityDateFr}.\nSincery Prestations"
                );
            } catch (\Throwable) {
                // Fail de SMS = non bloquant
            }
        });

        // Réponse finale adaptée au succès/échec de PDF / mail
        if (! $pdfGenerated) {
            $this->errorResponse(
                "Devis enregistré et marqué comme 'envoyé', mais la génération du PDF a échoué ({$pdfErrorMessage}). Le client n'a pas été prévenu. Réessayez ou contactez le support.",
                ['pdf_generated' => false, 'email_sent' => false],
                500,
            );
        }

        $refresh = $quoteRequest->load(['customer', 'items']);

        if (! $emailSent) {
            return $this->successResponse(
                [
                    'quote_request' => new QuoteRequestResource($refresh),
                    'pdf_generated' => true,
                    'email_sent' => false,
                    'email_error' => $emailErrorMessage,
                    'validity_date_fr' => $validityDateFr,
                    'issue_date_fr' => $issueDateFr,
                    'view_quote_url' => $viewQuoteUrl,
                ],
                "Devis tarifé et PDF généré avec succès. MAIS l'envoi de l'e-mail a échoué : {$emailErrorMessage}. Vous pouvez télécharger et envoyer le PDF manuellement.",
                202,
            );
        }

        return $this->successResponse(
            [
                'quote_request' => new QuoteRequestResource($refresh),
                'pdf_generated' => true,
                'email_sent' => true,
                'validity_date_fr' => $validityDateFr,
                'issue_date_fr' => $issueDateFr,
                'view_quote_url' => $viewQuoteUrl,
            ],
            "Devis tarifé et envoyé avec succès. Un e-mail avec PDF joint et un SMS ont été envoyés au client (validité {$validityDateFr}).",
        );
    }

    public function approve(QuoteRequest $quoteRequest)
    {
        if ($quoteRequest->status !== 'sent') {
            return $this->errorResponse("Seul un devis envoyé peut être approuvé", 422);
        }

        $quoteRequest->update(['status' => 'approved']);

        SendMessageEvent::dispatch($quoteRequest->customer->phone, "Votre demande de devis {$quoteRequest->reference} a été approuvée avec succès.\n\nSincery Prestations");

        return $this->successResponse(
            new QuoteRequestResource($quoteRequest->load(['customer', 'items'])),
            "Devis approuvé avec succès"
        );
    }

    public function reject(QuoteRequest $quoteRequest)
    {
        if ($quoteRequest->status !== 'sent') {
            return $this->errorResponse("Seul un devis envoyé peut être rejeté", 422);
        }

        $quoteRequest->update(['status' => 'rejected']);

        SendMessageEvent::dispatch($quoteRequest->customer->phone, "Votre demande de devis {$quoteRequest->reference} a été rejetée avec succès.\n\nSincery Prestations");

        return $this->successResponse(
            new QuoteRequestResource($quoteRequest->load(['customer', 'items'])),
            "Devis rejeté avec succès"
        );
    }

    // ————————————————————————————————————————————————————————————————————————
    // Public customer-facing pages (signed URLs from e-mail / QR code)
    // ————————————————————————————————————————————————————————————————————————

    public function showPublic(Request $request, string $reference)
    {
        // Signature already validated by 'signed' middleware.
        $quoteRequest = QuoteRequest::where('reference', $reference)
            ->with(['customer', 'items'])
            ->first();

        if (! $quoteRequest) {
            abort(404, "Devis introuvable");
        }

        $items = $quoteRequest->items;
        $subtotal = (float) $items->sum('total_price');
        $itemsCount = $items->count();
        $validityDateFr = $quoteRequest->validity_date
            ? Carbon::parse($quoteRequest->validity_date)->locale('fr_FR')->isoFormat('D MMMM YYYY')
            : '—';
        $issueDateFr = Carbon::parse($quoteRequest->created_at)->locale('fr_FR')->isoFormat('D MMMM YYYY');
        $company = self::company();

        return view('quote-requests.show-public', compact(
            'quoteRequest',
            'items',
            'itemsCount',
            'subtotal',
            'validityDateFr',
            'issueDateFr',
            'company',
        ));
    }

    public function approvePublic(Request $request, string $reference)
    {
        // Signature already validated by 'signed' middleware.
        $quoteRequest = QuoteRequest::where('reference', $reference)->first();
        if (! $quoteRequest) {
            abort(404, "Devis introuvable");
        }
        if ($quoteRequest->status !== 'sent') {
            return redirect()->back()->withErrors('Ce devis ne peut plus être approuvé (statut actuel : ' . $quoteRequest->status . ').');
        }

        $quoteRequest->update(['status' => 'approved']);
        try {
            SendMessageEvent::dispatch(
                $quoteRequest->customer->phone,
                "Bonjour {$quoteRequest->customer->full_name}, vous avez approuvé votre devis {$quoteRequest->reference}. Merci ! Notre équipe commerciale prend contact avec vous sous 24 h.\nSincery Prestations"
            );

            if ($this->getSuperAdmin()) {
                SendMessageEvent::dispatch($this->getSuperAdmin(), "Le devis {$quoteRequest->reference} a été approuvé par {$quoteRequest->customer->full_name}.");
            }
        } catch (\Throwable) {
        }
        $company = self::company();

        return view('quote-requests.action-result', [
            'quoteRequest' => $quoteRequest,
            'type' => 'approved',
            'company' => $company,
        ]);
    }

    public function rejectPublic(Request $request, string $reference)
    {
        $quoteRequest = QuoteRequest::where('reference', $reference)->first();
        if (! $quoteRequest) {
            abort(404, "Devis introuvable");
        }
        if ($quoteRequest->status !== 'sent') {
            return redirect()->back()->withErrors('Ce devis ne peut plus être rejeté (statut actuel : ' . $quoteRequest->status . ').');
        }

        $quoteRequest->update(['status' => 'rejected']);
        try {
            SendMessageEvent::dispatch(
                $quoteRequest->customer->phone,
                "Votre devis {$quoteRequest->reference} a été marqué comme rejeté. Pour une nouvelle proposition adaptée, contactez Sincery Prestations."
            );

            if ($this->getSuperAdmin()) {
                SendMessageEvent::dispatch($this->getSuperAdmin(), "Le devis {$quoteRequest->reference} a été rejeté par {$quoteRequest->customer->full_name}.");
            }
        } catch (\Throwable) {
        }
        $company = self::company();

        return view('quote-requests.action-result', [
            'quoteRequest' => $quoteRequest,
            'type' => 'rejected',
            'company' => $company,
        ]);
    }

    public function destroy(QuoteRequest $quoteRequest)
    {
        $quoteRequest->delete();

        return $this->successResponse(null, "Demande de devis supprimée avec succès");
    }

    private function generateReference(): string
    {
        $prefix = 'DEV-' . now()->year . '-';

        $lastReference = QuoteRequest::where('reference', 'like', "{$prefix}%")
            ->lockForUpdate()
            ->orderByDesc('reference')
            ->value('reference');

        $nextNumber = $lastReference
            ? ((int) substr($lastReference, strlen($prefix))) + 1
            : 1;

        return $prefix . sprintf('%04d', $nextNumber);
    }

    private function getSuperAdmin(): ?string
    {
        return User::where('role', 'super_admin')->first()->telephone ?? null;
    }
}
