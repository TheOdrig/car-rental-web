import { ApiError } from '@/shared/api';
import {
    clearAuthTokens,
    getRefreshToken,
    refreshAuthSession,
    route,
    setAuthTokens,
} from '@/shared/server';

export const POST = route(
    async () => {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            throw new ApiError(401, 'No refresh token');
        }

        const outcome = await refreshAuthSession(refreshToken);

        if (outcome.kind === 'rejected') {
            await clearAuthTokens();
            throw new ApiError(401, 'Token refresh failed');
        }

        if (outcome.kind === 'rate-limited') {
            const error = new ApiError(429, 'Too many refresh attempts');
            error.retryAfter = outcome.retryAfter;
            throw error;
        }

        if (outcome.kind === 'unavailable') {
            throw new ApiError(503, 'Authentication service unavailable');
        }

        await setAuthTokens(outcome.tokens);

        return { username: outcome.tokens.username, tokenType: outcome.tokens.tokenType };
    },
    { errorMessage: 'Internal server error' }
);
