import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.lateReturns.resolve(),
    forwardQuery: true,
    errorMessage: 'Failed to fetch late returns',
    errorStatus: 503,
});
