import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.rentals.me.resolve(),
    forwardQuery: true,
    tags: ['rentals', 'my-rentals'],
    errorMessage: 'Failed to fetch rentals',
    errorStatus: 503,
});
