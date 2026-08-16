<?php

use App\Modules\Management\Controllers\CommentController;
use App\Modules\Management\Controllers\ContactController;
use App\Modules\Management\Controllers\PartnerCategoryController;
use App\Modules\Management\Controllers\PartnerController;
use App\Modules\Management\Controllers\PostController;
use App\Modules\Management\Controllers\PostImageController;
use App\Modules\Management\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public endpoints (no authentication required)
|--------------------------------------------------------------------------
*/

// ————————————————————————————————————————
// Products
// ————————————————————————————————————————
Route::prefix('v1/products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('{product}', [ProductController::class, 'show']);
});

// ————————————————————————————————————————
// Posts / Actualités
// ————————————————————————————————————————
Route::prefix('v1/posts')->group(function () {
    Route::get('/', [PostController::class, 'index']);
    Route::get('{id}', [PostController::class, 'show']);
});

// ————————————————————————————————————————
// Comments (public list + create)
// ————————————————————————————————————————
Route::prefix('v1/comments')->group(function () {
    Route::get('/', [CommentController::class, 'index']);
    Route::post('/', [CommentController::class, 'store']);
});

// ————————————————————————————————————————
// Partner Categories & Partners
// ————————————————————————————————————————
Route::prefix('v1/partner-categories')->group(function () {
    Route::get('/', [PartnerCategoryController::class, 'index']);
    Route::get('{category}', [PartnerCategoryController::class, 'show']);
});

Route::prefix('v1/partners')->group(function () {
    Route::get('/', [PartnerController::class, 'index']);
    Route::get('{partner}', [PartnerController::class, 'show']);
});

// ————————————————————————————————————————
// Contact (public submission)
// ————————————————————————————————————————
Route::prefix('v1/contacts')->group(function () {
    Route::post('/', [ContactController::class, 'store']);
});

// ————————————————————————————————————————
// Post images (CKEditor SimpleUploadAdapter + retrieve)
// ————————————————————————————————————————
Route::middleware('auth:sanctum')->prefix('v1/post-images')->group(function () {
    Route::post('/', [PostImageController::class, 'store']);
    Route::get('{id}', [PostImageController::class, 'show']);
    Route::delete('{id}', [PostImageController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Authenticated admin endpoints (require Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // ————————————————————————————————————————
    // Products (admin)
    // ————————————————————————————————————————
    Route::prefix('v1/products')->group(function () {
        Route::get('trashed/list', [ProductController::class, 'trashed']);
        Route::post('restore/{product}', [ProductController::class, 'restore']);
        Route::delete('force-delete/{product}', [ProductController::class, 'forceDelete']);
    });
    Route::apiResource('v1/products', ProductController::class)->except(['index', 'show']);

    // ————————————————————————————————————————
    // Posts (admin)
    // ————————————————————————————————————————
    Route::prefix('v1/posts')->group(function () {
        Route::get('trashed/list', [PostController::class, 'trashed']);
        Route::post('restore/{post}', [PostController::class, 'restore']);
        Route::delete('force-delete/{post}', [PostController::class, 'forceDelete']);
    });
    Route::apiResource('v1/posts', PostController::class)->except(['index', 'show']);

    // ————————————————————————————————————————
    // Comments (admin approval / edit / delete)
    // ————————————————————————————————————————
    Route::prefix('v1/comments')->group(function () {
        Route::patch('switch-status/{comment}', [CommentController::class, 'switchStatus']);
    });
    Route::apiResource('v1/comments', CommentController::class)->except(['index', 'store']);

    // ————————————————————————————————————————
    // Contacts (admin inbox)
    // ————————————————————————————————————————
    Route::prefix('v1/contacts')->group(function () {
        Route::get('/', [ContactController::class, 'index']);
        Route::get('{contact}', [ContactController::class, 'show']);
        Route::delete('{contact}', [ContactController::class, 'destroy']);
    });

    // ————————————————————————————————————————
    // Partner Categories (admin)
    // ————————————————————————————————————————
    Route::apiResource('v1/partner-categories', PartnerCategoryController::class)->except(['index', 'show']);

    // ————————————————————————————————————————
    // Partners (admin)
    // ————————————————————————————————————————
    Route::prefix('v1/partners')->group(function () {
        Route::get('trashed/list', [PartnerControler::class, 'trashed']);
        Route::post('restore/{post}', [PartnerControler::class, 'restore']);
        Route::delete('force-delete/{post}', [PartnerControler::class, 'forceDelete']);
    });
    Route::apiResource('v1/partners', PartnerController::class)->except(['index', 'show']);
});
