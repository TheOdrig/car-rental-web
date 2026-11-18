import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.quickActions.reject(parseIdParam(id, 'rental ID')),
    method: 'POST',
    body: 'optional',
    errorMessage: 'Failed to reject rental',
    errorStatus: 503,
});
