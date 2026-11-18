import { proxy } from '@/shared/server';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export const GET = proxy({
    path: () => ADMIN_ENDPOINTS.users.list,
    forwardQuery: true,
    tags: ['admin', 'users'],
    errorMessage: 'Failed to fetch users',
    errorStatus: 503,
});
