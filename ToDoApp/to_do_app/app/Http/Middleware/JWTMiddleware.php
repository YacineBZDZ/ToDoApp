<?php

namespace App\Http\Middleware;

use App\Services\JWTManager;
use App\Services\AuthTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JWTMiddleware
{
    protected JWTManager $jwtManager;
    protected AuthTokenService $authTokenService;

    public function __construct(JWTManager $jwtManager, AuthTokenService $authTokenService)
    {
        $this->jwtManager = $jwtManager;
        $this->authTokenService = $authTokenService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $this->validateJWTToken($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. Please provide a valid token.',
                'error' => 'TOKEN_INVALID'
            ], 401);
        }

        // Add the authenticated user to the request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }

    /**
     * Validate JWT token and return user if valid
     */
    public function validateJWTToken(Request $request): ?\App\Models\User
    {
        $token = $this->extractTokenFromHeader($request);

        if (!$token) {
            return null;
        }

        try {
            // First validate the JWT token structure and signature
            $payload = $this->jwtManager->validateToken($token);
            
            if (!$payload) {
                return null;
            }

            // Check if it's an access token
            if (!isset($payload['type']) || $payload['type'] !== 'access') {
                return null;
            }

            // Get user from JWT payload
            $user = $this->jwtManager->getUserFromToken($token);
            
            if (!$user) {
                return null;
            }

            // Optional: Also check if token exists in database (for additional security)
            // This allows for token revocation
            if (!$this->authTokenService->isTokenValid($token)) {
                // Token was revoked or doesn't exist in database
                return null;
            }

            return $user;

        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Extract JWT token from Authorization header
     */
    public function extractTokenFromHeader(Request $request): ?string
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        return substr($authHeader, 7); // Remove 'Bearer ' prefix
    }
}
