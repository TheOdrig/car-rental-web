import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.dashboard.pending.overdue,
    forwardQuery: true,
    tags: ['admin', 'pending', 'overdue'],
    errorMessage: 'Failed to fetch pending overdue rentals',
    errorStatus: 503,
});
