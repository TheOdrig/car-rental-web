import { AUTH_ENDPOINTS } from '@/features/auth';
import { logger } from '@/shared/lib/logger';
import { clearAuthTokens, getRefreshToken, route, upstream } from '@/shared/server';

export const POST = route(
    async () => {
        const refreshToken = await getRefreshToken();

        try {
            if (refreshToken) {
                await upstream.post(AUTH_ENDPOINTS.logout, { refreshToken }, { anonymous: true, cache: 'no-store' });
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
