<?php

namespace App\Services;

use App\Models\AuthToken;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class AuthTokenService
{
    public function createToken(User $user, string $type = 'access'): AuthToken
    {
        $expiresAt = $type === 'access' 
            ? now()->addMinutes(60) // 1 hour for access tokens
            : now()->addDays(30);   // 30 days for refresh tokens

        // Generate a unique token string
        $tokenString = $this->generateUniqueToken();

        return AuthToken::create([
            'user_id' => $user->id,
            'token' => $tokenString,
            'type' => $type,
            'expires_at' => $expiresAt,
            'is_revoked' => false,
        ]);
    }

    public function storeJWTToken(int $userId, string $jwtToken, string $type = 'access'): AuthToken
    {
        $expiresAt = $type === 'access' 
            ? now()->addMinutes(60) // 1 hour for access tokens
            : now()->addDays(30);   // 30 days for refresh tokens

        return AuthToken::create([
            'user_id' => $userId,
            'token' => $jwtToken,
            'type' => $type,
            'expires_at' => $expiresAt,
            'is_revoked' => false,
        ]);
    }

    public function revokeUserTokens(int $userId, string $type = null): void
    {
        $query = AuthToken::where('user_id', $userId);
        
        if ($type) {
            $query->where('type', $type);
        }

        $query->update(['is_revoked' => true]);
    }

    public function findValidToken(string $token): ?AuthToken
    {
        return AuthToken::where('token', $token)
            ->valid()
            ->first();
    }

    public function cleanExpiredTokens(): void
    {
        AuthToken::where('expires_at', '<', now())
            ->orWhere('is_revoked', true)
            ->delete();
    }

    public function getUserByToken(string $token): ?User
    {
        $authToken = $this->findValidToken($token);
        
        if (!$authToken) {
            return null;
        }

        return $authToken->user;
    }

    public function refreshUserTokens(User $user): array
    {
        // Revoke all existing tokens for the user
        $this->revokeUserTokens($user->id);

        // Create new access and refresh tokens
        $accessToken = $this->createToken($user, 'access');
        $refreshToken = $this->createToken($user, 'refresh');

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    public function getValidTokensForUser(int $userId, string $type = null): Collection
    {
        $query = AuthToken::where('user_id', $userId)->valid();
        
        if ($type) {
            $query->byType($type);
        }

        return $query->get();
    }

    public function revokeToken(string $token): bool
    {
        $authToken = AuthToken::where('token', $token)->first();
        
        if ($authToken) {
            $authToken->revoke();
            return true;
        }

        return false;
    }

    public function isTokenValid(string $token): bool
    {
        $authToken = AuthToken::where('token', $token)->first();
        return $authToken && $authToken->isValid();
    }

    private function generateUniqueToken(): string
    {
        do {
            $token = bin2hex(random_bytes(32)); // 64 character hex string
        } while (AuthToken::where('token', $token)->exists());

        return $token;
    }

    public function getTokenStatistics(int $userId): array
    {
        $user = User::find($userId);
        
        if (!$user) {
            return [];
        }

        return [
            'total_tokens' => $user->authTokens()->count(),
            'active_tokens' => $user->authTokens()->valid()->count(),
            'access_tokens' => $user->authTokens()->valid()->byType('access')->count(),
            'refresh_tokens' => $user->authTokens()->valid()->byType('refresh')->count(),
            'revoked_tokens' => $user->authTokens()->where('is_revoked', true)->count(),
            'expired_tokens' => $user->authTokens()->where('expires_at', '<', now())->count(),
        ];
    }
}
