import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.alerts.resolve(),
    forwardQuery: true,
    errorMessage: 'Failed to fetch alerts',
    errorStatus: 503,
});
