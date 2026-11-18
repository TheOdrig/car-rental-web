import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.dashboard.revenue.resolve(),
    tags: ['admin', 'dashboard', 'revenue'],
    errorMessage: 'Failed to fetch revenue analytics',
    errorStatus: 503,
});
