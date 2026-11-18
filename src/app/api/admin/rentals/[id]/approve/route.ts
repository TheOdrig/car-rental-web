import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.quickActions.approve(parseIdParam(id, 'rental ID')),
    method: 'POST',
    body: 'optional',
    errorMessage: 'Failed to approve rental',
    errorStatus: 503,
});
