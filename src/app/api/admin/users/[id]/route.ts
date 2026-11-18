import { ADMIN_ENDPOINTS } from '@/features/admin';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => ADMIN_ENDPOINTS.users.byId(parseIdParam(id, 'user ID')),
    tags: ['admin', 'users', 'detail'],
    errorMessage: 'Failed to fetch user',
    errorStatus: 503,
});
