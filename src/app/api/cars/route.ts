import { proxy } from '@/shared/server';
import { CAR_ENDPOINTS } from '@/entities/car';

export const GET = proxy({
    path: () => CAR_ENDPOINTS.search,
    forwardQuery: true,
    tags: ['cars'],
    anonymous: true,
    errorMessage: 'Failed to fetch cars',
    errorStatus: 503,
});
