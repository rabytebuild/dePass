<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\PassController;
use App\Http\Controllers\Api\PassTypeController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Users
    Route::apiResource('users', UserController::class);

    // Organizations
    Route::apiResource('organizations', OrganizationController::class);

    // Events
    Route::apiResource('events', EventController::class);
    Route::put('/events/{event}/lock', [EventController::class, 'lock']);

    // Pass Types
    Route::apiResource('events.pass-types', PassTypeController::class)->shallow();

    // Passes
    Route::apiResource('events.passes', PassController::class)->shallow();
    Route::post('/events/{event}/passes/bulk-generate', [PassController::class, 'bulkGenerate']);
    Route::get('/events/{event}/package', [EventController::class, 'package']);
});
