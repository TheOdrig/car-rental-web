import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.rentals.byId.resolve({ id: parseIdParam(id, 'rental ID') }),
    tags: ['rentals'],
    errorMessage: 'Failed to fetch rental',
    errorStatus: 503,
});

export const DELETE = proxy<{ id: string }>({
    target: ({ id }) => API.rentals.cancel.resolve({ id: parseIdParam(id, 'rental ID') }),
    body: 'none',
    errorMessage: 'Failed to cancel rental',
    errorStatus: 503,
});
