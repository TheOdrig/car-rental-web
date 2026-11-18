import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.dashboard.pending.approvals,
    forwardQuery: true,
    tags: ['admin', 'pending', 'approvals'],
    errorMessage: 'Failed to fetch pending approvals',
    errorStatus: 503,
});
