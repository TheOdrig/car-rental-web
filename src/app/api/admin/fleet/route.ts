import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.dashboard.fleet,
    tags: ['admin', 'fleet'],
    errorMessage: 'Failed to fetch fleet status',
    errorStatus: 503,
});
