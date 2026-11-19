import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.rentals.cancel.resolve({ id: parseIdParam(id, 'rental ID') }),
    body: 'optional',
    errorMessage: 'Failed to cancel rental',
    errorStatus: 503,
});
