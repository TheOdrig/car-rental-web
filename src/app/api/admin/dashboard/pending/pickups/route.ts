import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.dashboard.pickups.resolve(),
    forwardQuery: true,
    tags: ['admin', 'pending', 'pickups'],
    errorMessage: 'Failed to fetch pending pickups',
    errorStatus: 503,
});
