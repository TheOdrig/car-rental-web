import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.dashboard.fleet.resolve(),
    tags: ['admin', 'fleet'],
    errorMessage: 'Failed to fetch fleet status',
    errorStatus: 503,
});
