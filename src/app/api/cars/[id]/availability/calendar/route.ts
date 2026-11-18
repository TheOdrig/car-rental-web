import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.cars.calendar.resolve({ id: parseIdParam(id, 'car ID') }),
    forwardQuery: true,
    anonymous: true,
    errorMessage: 'Failed to fetch availability calendar',
    errorStatus: 503,
});
