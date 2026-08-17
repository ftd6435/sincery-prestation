<?php

use App\Modules\ERP\Controllers\QuoteRequestController;
use App\Modules\Settings\Controllers\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::get('/newsletter/verify', [NewsletterController::class, 'verify'])
    ->middleware('signed')
    ->name('newsletter.verify');

/*
|--------------------------------------------------------------------------
| Customer-facing quote pages (accessed via signed URL in e-mail / QR code)
|--------------------------------------------------------------------------
*/

Route::prefix('devis')->middleware('signed')->group(function () {
    Route::get('{reference}', [QuoteRequestController::class, 'showPublic'])
        ->name('quote-requests.public.show');
    Route::post('{reference}/approuver', [QuoteRequestController::class, 'approvePublic'])
        ->name('quote-requests.public.approve');
    Route::post('{reference}/rejeter', [QuoteRequestController::class, 'rejectPublic'])
        ->name('quote-requests.public.reject');
});

Route::fallback(function () {
    return view('app');
});
