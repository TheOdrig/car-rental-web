import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.users.ban(parseIdParam(id, 'user ID')),
    method: 'POST',
    respond: () => ({ success: true }),
    errorMessage: 'Failed to ban user',
    errorStatus: 503,
});
