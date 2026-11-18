import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.users.unban(parseIdParam(id, 'user ID')),
    method: 'POST',
    body: 'optional',
    respond: () => ({ success: true }),
    errorMessage: 'Failed to unban user',
    errorStatus: 503,
});
