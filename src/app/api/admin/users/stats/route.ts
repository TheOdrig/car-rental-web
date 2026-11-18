import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.users.stats,
    tags: ['admin', 'users', 'stats'],
    errorMessage: 'Failed to fetch user statistics',
    errorStatus: 503,
});
