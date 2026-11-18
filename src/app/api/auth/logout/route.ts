import { logger } from '@/shared/lib/logger';
import { API, clearAuthTokens, forgetRefresh, getRefreshToken, route, upstream } from '@/shared/server';

export const POST = route(
    async () => {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
            forgetRefresh(refreshToken);
        }

        try {
            if (refreshToken) {
                await upstream.post(API.auth.logout.resolve(), { refreshToken }, { anonymous: true, cache: 'no-store' });
            }
        } catch (error) {
            logger.warn('[BFF] Upstream logout failed', error);
        } finally {
            await clearAuthTokens();
        }

        return { message: 'Logged out successfully' };
    },
    { errorMessage: 'Internal server error' }
);
