import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.rentals.admin.resolve(),
    forwardQuery: true,
    tags: ['rentals'],
    errorMessage: 'Failed to fetch rentals',
    errorStatus: 503,
});
