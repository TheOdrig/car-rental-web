import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.damages.statistics.resolve(),
    forwardQuery: true,
    errorMessage: 'Failed to fetch damage statistics',
});
