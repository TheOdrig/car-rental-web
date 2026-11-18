import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.dashboard.returns.resolve(),
    forwardQuery: true,
    tags: ['admin', 'pending', 'returns'],
    errorMessage: 'Failed to fetch pending returns',
    errorStatus: 503,
});
