import { CAR_ENDPOINTS } from '@/entities/car';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => CAR_ENDPOINTS.availability.calendar(parseIdParam(id, 'car ID')),
    forwardQuery: true,
    errorMessage: 'Failed to fetch availability calendar',
    errorStatus: 503,
});
