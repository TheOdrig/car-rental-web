import { clearAuthTokens, route } from '@/shared/server';

export const POST = route(
    async () => {
        await clearAuthTokens();
        return { message: 'Logged out successfully' };
    },
    { errorMessage: 'Internal server error' }
);
