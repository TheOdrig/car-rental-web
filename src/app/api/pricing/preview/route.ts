import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.pricing.preview.resolve(),
    forwardQuery: true,
    anonymous: true,
    errorMessage: 'Failed to fetch pricing preview',
    errorStatus: 503,
});
