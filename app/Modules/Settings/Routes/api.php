<?php

use App\Modules\Settings\Controllers\CategoryController;
use App\Modules\Settings\Controllers\NewsletterController;
use App\Modules\Settings\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public endpoints (no authentication required)
|--------------------------------------------------------------------------
*/

// ————————————————————————————————————————
// Categories (product categories, public list + detail)
// ————————————————————————————————————————
Route::prefix('v1/categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('{category}', [CategoryController::class, 'show']);
});

// ————————————————————————————————————————
// Newsletter (public signup)
// ————————————————————————————————————————
Route::post('v1/newsletter/subscribe', [NewsletterController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Authenticated admin endpoints (require Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // ————————————————————————————————————————
    // Categories (admin)
    // ————————————————————————————————————————
    Route::prefix('v1/categories')->group(function () {
        Route::get('trashed/list', [CategoryController::class, 'trashed']);
        Route::post('restore/{category}', [CategoryController::class, 'restore']);
        Route::delete('force-delete/{category}', [CategoryController::class, 'forceDelete']);
    });
    Route::apiResource('v1/categories', CategoryController::class)->except(['index', 'show']);

    // ————————————————————————————————————————
    // Newsletter (admin: list / unsubscribe / delete)
    // ————————————————————————————————————————
    Route::prefix('v1/newsletter')->group(function () {
        Route::get('/', [NewsletterController::class, 'index']);
        Route::delete('{newsletter}', [NewsletterController::class, 'destroy']);
    });

    // ————————————————————————————————————————
    // Settings (CRUD: key/value with type casting)
    // ————————————————————————————————————————
    Route::prefix('v1/settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::get('{setting}', [SettingController::class, 'show']);
        Route::post('/', [SettingController::class, 'store']);
        Route::put('{setting}', [SettingController::class, 'update']);
        Route::patch('{setting}', [SettingController::class, 'update']);
        Route::delete('{setting}', [SettingController::class, 'destroy']);
    });
});
