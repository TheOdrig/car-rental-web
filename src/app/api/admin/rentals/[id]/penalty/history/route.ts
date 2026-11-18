import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.penaltyHistory(parseIdParam(id, 'rental ID')),
    errorMessage: 'Failed to fetch penalty history',
    errorStatus: 503,
});
