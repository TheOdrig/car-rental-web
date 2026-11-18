import { proxy } from '@/shared/server';
import { RENTAL_ENDPOINTS } from '@/entities/rental';

export const GET = proxy({
    path: () => RENTAL_ENDPOINTS.list,
    forwardQuery: true,
    tags: ['rentals'],
    errorMessage: 'Failed to fetch rentals',
    errorStatus: 503,
});

export const POST = proxy({
    path: () => RENTAL_ENDPOINTS.request,
    method: 'POST',
    status: 201,
    errorMessage: 'Failed to create rental request',
    errorStatus: 503,
});
