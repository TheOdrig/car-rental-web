import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.lateReturnStatistics.resolve(),
    forwardQuery: true,
    errorMessage: 'Failed to fetch late return statistics',
    errorStatus: 503,
});
