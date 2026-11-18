import { proxy } from '@/shared/server';
import { CAR_ENDPOINTS } from '@/entities/car';

export const GET = proxy({
    path: () => CAR_ENDPOINTS.featured,
    forwardQuery: true,
    tags: ['cars', 'featured'],
    errorMessage: 'Failed to fetch featured cars',
    errorStatus: 503,
});
