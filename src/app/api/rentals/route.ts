import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.rentals.admin.resolve(),
    forwardQuery: true,
    tags: ['rentals'],
    errorMessage: 'Failed to fetch rentals',
    errorStatus: 503,
});

export const POST = proxy({
    target: () => API.rentals.request.resolve(),
    status: 201,
    errorMessage: 'Failed to create rental request',
    errorStatus: 503,
});
