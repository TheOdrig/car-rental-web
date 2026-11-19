import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.rentals.byId.resolve({ id: parseIdParam(id, 'rental ID') }),
    tags: ['rentals'],
    errorMessage: 'Failed to fetch rental',
    errorStatus: 503,
});
