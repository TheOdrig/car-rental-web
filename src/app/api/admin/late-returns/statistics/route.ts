import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.lateReturnStatistics,
    forwardQuery: true,
    errorMessage: 'Failed to fetch late return statistics',
    errorStatus: 503,
});
