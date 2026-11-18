import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.dashboard.summary.resolve(),
    tags: ['admin', 'dashboard', 'summary'],
    errorMessage: 'Failed to fetch dashboard summary',
    errorStatus: 503,
});
