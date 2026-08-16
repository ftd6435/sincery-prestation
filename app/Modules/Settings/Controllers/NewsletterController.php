<?php

namespace App\Modules\Settings\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Mail\NewsletterVerification;
use App\Modules\Settings\Models\Newsletter;
use App\Modules\Settings\Requests\NewsletterRequest;
use App\Modules\Settings\Resources\NewsletterResource;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    use ApiResponses;

    public function index()
    {
        $newsletters = Newsletter::orderBy('created_at', 'desc')->get();

        return $this->successResponse(
            NewsletterResource::collection($newsletters),
            "Abonnements de newsletter chargés avec succès."
        );
    }

    /**
     * Endpoint public : abonnement à la newsletter.
     * - Valide les champs via NewsletterRequest
     * - Vérifie les doublons
     * - Génère un token de vérification signé (48h)
     * - Envoie un e-mail de confirmation contenant le lien signé
     */
    public function store(NewsletterRequest $request)
    {
        $data = $request->validated();
        $data['is_verified'] = false;
        $data['verification_token'] = Str::random(60);
        $data['verified_at'] = null;

        if (Newsletter::where('email', $data['email'])->exists()) {
            return $this->errorResponse(
                "Vous êtes déjà abonné à la newsletter.",
                code: 409
            );
        }

        $newsletter = Newsletter::create($data);

        // Lien signé valide 48h, utilisable sans authentification
        $verifyUrl = URL::temporarySignedRoute(
            'newsletter.verify',
            now()->addHours(48),
            ['token' => $newsletter->verification_token],
        );

        try {
            Mail::to($newsletter->email, $newsletter->name)
                ->queue(new NewsletterVerification($newsletter, $verifyUrl));
        } catch (\Throwable $mailError) {
            report($mailError);

            return $this->errorResponse(
                "Inscription enregistrée, mais l'envoi de l'e-mail de confirmation a échoué. Réessayez plus tard ou contactez le support.",
                [
                    'newsletter' => (new NewsletterResource($newsletter))->resolve(),
                    'mail_sending_failed' => true,
                ],
                502,
            );
        }

        return $this->successResponse(
            (new NewsletterResource($newsletter))->resolve() + ['email_sent' => true],
            "Abonnement de newsletter créé avec succès. Un e-mail de confirmation a été envoyé à {$newsletter->email}.",
            201,
        );
    }

    /**
     * Endpoint public signé : clique sur le lien dans l'e-mail → passe is_verified=true + verified_at=now
     * - Vérifie la signature du lien (48h)
     * - Retrouve l'abonné par son token
     * - Invalide le token après usage
     * - Affiche une page Blade de confirmation (ou l'erreur correspondante)
     */
    public function verify(Request $request)
    {
        // 1) Le lien a-t-il expiré ou été altéré ? (middleware signed contrôle déjà la signature,
        //    mais on garde un fallback explicit pour les cas sans middleware)
        if (! $request->hasValidSignature()) {
            return view('emails.newsletter.verify-expired');
        }

        $token = $request->input('token');
        if (! $token || ! is_string($token)) {
            return view('emails.newsletter.verify-invalid');
        }

        $newsletter = Newsletter::where('verification_token', $token)->first();
        if (! $newsletter) {
            return view('emails.newsletter.verify-invalid');
        }

        // 2) Marquer comme vérifié — on détruit le token (usage unique)
        $newsletter->forceFill([
            'is_verified' => true,
            'verified_at' => now(),
            'verification_token' => null,
        ])->save();

        return view('emails.newsletter.verify-success', [
            'name' => $newsletter->name,
            'email' => $newsletter->email,
        ]);
    }

    public function destroy(Newsletter $newsletter)
    {
        $newsletter->delete();

        return $this->noContentSuccessResponse(
            "Abonnement de newsletter supprimé avec succès."
        );
    }
}
