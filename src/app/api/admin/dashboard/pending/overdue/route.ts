import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.dashboard.overdue.resolve(),
    forwardQuery: true,
    tags: ['admin', 'pending', 'overdue'],
    errorMessage: 'Failed to fetch pending overdue rentals',
    errorStatus: 503,
});
