import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.cars.filterOptions.resolve(),
    anonymous: true,
    errorMessage: 'Failed to fetch filter options',
    errorStatus: 503,
});
