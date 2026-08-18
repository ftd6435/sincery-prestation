<?php

use App\Modules\Analytics\Controllers\AnalyticController;
use Illuminate\Support\Facades\Route;

Route::prefix('analytics')->group(function () {
    Route::get('/', [AnalyticController::class, 'index'])->middleware('auth:sanctum');

    Route::post('/track', [AnalyticController::class, 'track']);
});
