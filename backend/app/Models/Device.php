<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'uuid', 'public_key', 'device_fingerprint', 'status', 'approved_by', 'approved_at'])]
class Device extends Model
{
    use HasFactory;

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user who registered this device.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who approved this device.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get all scans from this device.
     */
    public function scans(): HasMany
    {
        return $this->hasMany(Scan::class);
    }
}
