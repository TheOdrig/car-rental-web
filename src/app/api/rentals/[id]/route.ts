import { RENTAL_ENDPOINTS } from '@/entities/rental';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => RENTAL_ENDPOINTS.byId(parseIdParam(id, 'rental ID')),
    tags: ['rentals'],
    errorMessage: 'Failed to fetch rental',
    errorStatus: 503,
});

export const DELETE = proxy<{ id: string }>({
    path: ({ id }) => RENTAL_ENDPOINTS.cancel(parseIdParam(id, 'rental ID')),
    method: 'POST',
    body: 'none',
    errorMessage: 'Failed to cancel rental',
    errorStatus: 503,
});
