import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.dashboard.revenue,
    tags: ['admin', 'dashboard', 'revenue'],
    errorMessage: 'Failed to fetch revenue analytics',
    errorStatus: 503,
});
