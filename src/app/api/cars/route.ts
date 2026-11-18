import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.cars.search.resolve(),
    forwardQuery: true,
    tags: ['cars'],
    anonymous: true,
    errorMessage: 'Failed to fetch cars',
    errorStatus: 503,
});
