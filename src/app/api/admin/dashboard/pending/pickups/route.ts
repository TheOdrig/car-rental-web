import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.dashboard.pending.pickups,
    forwardQuery: true,
    tags: ['admin', 'pending', 'pickups'],
    errorMessage: 'Failed to fetch pending pickups',
    errorStatus: 503,
});
