<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['key', 'value', 'description', 'created_by'])]
class SystemConfiguration extends Model
{
    protected $casts = [
        'value' => 'json',
    ];
}
