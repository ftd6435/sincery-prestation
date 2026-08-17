<?php

use App\Modules\ERP\Controllers\OrderController;
use App\Modules\ERP\Controllers\QuoteRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public endpoints (no authentication required)
|--------------------------------------------------------------------------
*/

Route::prefix('v1/quote-requests')->group(function () {
    Route::post('/', [QuoteRequestController::class, 'store']);
});

Route::prefix('v1/orders')->group(function () {
    Route::post('/', [OrderController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Authenticated admin endpoints (require Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('v1/quote-requests')->group(function () {
        Route::get('/', [QuoteRequestController::class, 'index']);
        Route::get('{quoteRequest}', [QuoteRequestController::class, 'show']);
        Route::post('{quoteRequest}/set-pricing', [QuoteRequestController::class, 'setPricing'])->name('quote-requests.set-pricing');
        Route::post('{quoteRequest}/approve', [QuoteRequestController::class, 'approve'])->name('quote-requests.approve');
        Route::post('{quoteRequest}/reject', [QuoteRequestController::class, 'reject'])->name('quote-requests.reject');
        Route::delete('{quoteRequest}', [QuoteRequestController::class, 'destroy']);
    });

    Route::prefix('v1/orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('{order}', [OrderController::class, 'show']);
        Route::match(['put', 'patch'], '{order}', [OrderController::class, 'update']);
        Route::post('{order}/confirm', [OrderController::class, 'confirm'])->name('orders.confirm');
        Route::post('{order}/deliver', [OrderController::class, 'deliver'])->name('orders.deliver');
        Route::post('{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
        Route::delete('{order}', [OrderController::class, 'destroy']);
    });
});
