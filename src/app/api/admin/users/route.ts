import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.users.list.resolve(),
    forwardQuery: true,
    tags: ['admin', 'users'],
    errorMessage: 'Failed to fetch users',
    errorStatus: 503,
});
