import { API, proxy } from '@/shared/server';
import { toPageResponse } from './_lib/page-response';

export const GET = proxy({
    target: () => API.cars.search.resolve(),
    forwardQuery: true,
    tags: ['cars'],
    anonymous: true,
    respond: toPageResponse,
    errorMessage: 'Failed to fetch cars',
    errorStatus: 503,
});
