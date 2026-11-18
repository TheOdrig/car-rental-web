import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.dashboard.approvals.resolve(),
    forwardQuery: true,
    tags: ['admin', 'pending', 'approvals'],
    errorMessage: 'Failed to fetch pending approvals',
    errorStatus: 503,
});
