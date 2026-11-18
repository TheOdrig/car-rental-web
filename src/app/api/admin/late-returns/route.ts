import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.lateReturns,
    forwardQuery: true,
    errorMessage: 'Failed to fetch late returns',
    errorStatus: 503,
});
