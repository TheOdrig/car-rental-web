import { CAR_ENDPOINTS } from '@/entities/car';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => CAR_ENDPOINTS.availability.similar(parseIdParam(id, 'car ID')),
    forwardQuery: true,
    anonymous: true,
    errorMessage: 'Failed to fetch similar cars',
    errorStatus: 503,
});
