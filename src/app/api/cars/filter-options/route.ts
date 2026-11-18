import { proxy } from '@/shared/server';
import { CAR_ENDPOINTS } from '@/entities/car';

export const GET = proxy({
    path: () => CAR_ENDPOINTS.filterOptions,
    anonymous: true,
    errorMessage: 'Failed to fetch filter options',
    errorStatus: 503,
});
