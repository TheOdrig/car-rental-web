import { proxy } from '@/shared/server';

export const GET = proxy({
    path: () => '/api/pricing/preview',
    forwardQuery: true,
    errorMessage: 'Failed to fetch pricing preview',
    errorStatus: 503,
});
