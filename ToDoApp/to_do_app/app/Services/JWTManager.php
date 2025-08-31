<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Carbon\Carbon;

class JWTManager
{
    private string $secretKey;
    private string $algorithm;
    private int $accessTokenExpiresIn; // minutes
    private int $refreshTokenExpiresIn; // days

    public function __construct()
    {
        $this->secretKey = config('app.key');
        $this->algorithm = 'HS256';
        $this->accessTokenExpiresIn = 60; // 1 hour
        $this->refreshTokenExpiresIn = 30; // 30 days
    }

    public function generateAccessToken(User $user): string
    {
        $payload = [
            'iss' => config('app.url'), // Issuer
            'sub' => $user->id, // Subject
            'aud' => config('app.url'), // Audience
            'iat' => now()->timestamp, // Issued at
            'exp' => now()->addMinutes($this->accessTokenExpiresIn)->timestamp, // Expires at
            'type' => 'access',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'name' => $user->name,
            ]
        ];

        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }

    public function generateRefreshToken(User $user): string
    {
        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'aud' => config('app.url'),
            'iat' => now()->timestamp,
            'exp' => now()->addDays($this->refreshTokenExpiresIn)->timestamp,
            'type' => 'refresh',
            'user' => [
                'id' => $user->id,
            ]
        ];

        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }

    public function validateToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, $this->algorithm));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            return null; // Token expired
        } catch (\Exception $e) {
            return null; // Invalid token
        }
    }

    public function decodeToken(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, $this->algorithm));
            return (array) $decoded;
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('Invalid token format');
        }
    }

    public function getTokenPayload(string $token): array
    {
        $payload = $this->validateToken($token);
        
        if (!$payload) {
            throw new \InvalidArgumentException('Invalid or expired token');
        }

        return $payload;
    }

    public function isTokenExpired(string $token): bool
    {
        try {
            $payload = $this->decodeToken($token);
            return $payload['exp'] < now()->timestamp;
        } catch (\Exception $e) {
            return true;
        }
    }

    public function getUserFromToken(string $token): ?User
    {
        $payload = $this->validateToken($token);
        
        if (!$payload || !isset($payload['user'])) {
            return null;
        }

        $userData = (array) $payload['user'];
        return User::find($userData['id']);
    }

    public function getTokenType(string $token): ?string
    {
        $payload = $this->validateToken($token);
        return $payload['type'] ?? null;
    }

    public function encryptPassword(string $password): string
    {
        return bcrypt($password);
    }

    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
}
