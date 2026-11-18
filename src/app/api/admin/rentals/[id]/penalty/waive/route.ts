import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.penaltyWaive(parseIdParam(id, 'rental ID')),
    method: 'POST',
    errorMessage: 'Failed to waive penalty',
    errorStatus: 503,
});
