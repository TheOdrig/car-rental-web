import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.quickActions.pickup(parseIdParam(id, 'rental ID')),
    method: 'POST',
    body: 'optional',
    errorMessage: 'Failed to record pickup',
    errorStatus: 503,
});
