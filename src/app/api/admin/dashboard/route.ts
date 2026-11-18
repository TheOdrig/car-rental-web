import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.dashboard.summary,
    tags: ['admin', 'dashboard', 'summary'],
    errorMessage: 'Failed to fetch dashboard summary',
    errorStatus: 503,
});
