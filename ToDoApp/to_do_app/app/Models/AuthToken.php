<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AuthToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'type',
        'expires_at',
        'is_revoked',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_revoked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'token',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function revoke(): void
    {
        $this->update(['is_revoked' => true]);
    }

    public function isValid(): bool
    {
        return !$this->is_revoked && !$this->isExpired();
    }

    public function scopeValid($query)
    {
        return $query->where('is_revoked', false)
                    ->where('expires_at', '>', now());
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
