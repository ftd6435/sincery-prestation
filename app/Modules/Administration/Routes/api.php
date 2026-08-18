<?php

use App\Modules\Administration\Controllers\AuthController;
use App\Modules\Administration\Controllers\DashboardStatsController;
use Illuminate\Support\Facades\Route;

// Define API routes for Administration module here
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware(['auth:sanctum'])->prefix('v1/auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::middleware(['auth:sanctum'])->prefix('v1/admin')->group(function () {
    Route::get('/stats/dashboard', [DashboardStatsController::class, 'index'])
        ->name('admin.stats.dashboard');

    Route::post('/register', [AuthController::class, 'register']); // Only admin can register a new user
    Route::patch('/switch-status/{user}', [AuthController::class, 'switchStatus']);
    Route::get('/users', [AuthController::class, 'users']);
});
