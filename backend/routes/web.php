<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome');
Route::view('/admin', 'admin');

// Admin authentication (session-based)
Route::get('/login', [AdminAuthController::class, 'loginForm'])->name('login');
Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login');
Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');

Route::middleware(['auth:web', 'can:access-admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/events', [AdminController::class, 'events'])->name('admin.events');
    Route::get('/devices', [AdminController::class, 'devices'])->name('admin.devices');
    Route::get('/scans', [AdminController::class, 'scans'])->name('admin.scans');
});
