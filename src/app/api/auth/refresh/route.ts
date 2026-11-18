import { ApiError } from '@/shared/api';
import {
    clearAuthTokens,
    getRefreshToken,
    refreshAuthTokens,
    route,
    setAuthTokens,
} from '@/shared/server';

export const POST = route(
    async () => {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            throw new ApiError(401, 'No refresh token');
        }

        const tokens = await refreshAuthTokens(refreshToken);

        if (!tokens) {
            await clearAuthTokens();
            throw new ApiError(401, 'Token refresh failed');
        }

        await setAuthTokens(tokens);

        return { username: tokens.username, tokenType: tokens.tokenType };
    },
    { errorMessage: 'Internal server error' }
);
