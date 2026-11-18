import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.dashboard.pending.returns,
    forwardQuery: true,
    tags: ['admin', 'pending', 'returns'],
    errorMessage: 'Failed to fetch pending returns',
    errorStatus: 503,
});
