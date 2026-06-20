<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['organization_id', 'name', 'date', 'location', 'event_secret', 'status', 'created_by'])]
class Event extends Model
{
    protected $casts = [
        'date' => 'datetime',
    ];

    /**
     * Get the organization this event belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the user who created this event.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all pass types for this event.
     */
    public function passTypes(): HasMany
    {
        return $this->hasMany(PassType::class);
    }

    /**
     * Get all passes for this event.
     */
    public function passes(): HasMany
    {
        return $this->hasMany(Pass::class);
    }

    /**
     * Get all pass templates for this event.
     */
    public function passTemplates(): HasMany
    {
        return $this->hasMany(PassTemplate::class);
    }
}
