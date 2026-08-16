<?php

use App\Modules\Settings\Controllers\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::get('/newsletter/verify', [NewsletterController::class, 'verify'])
    ->middleware('signed')
    ->name('newsletter.verify');

Route::fallback(function () {
    return view('app');
});
