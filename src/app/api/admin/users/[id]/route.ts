import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.admin.users.byId.resolve({ id: parseIdParam(id, 'user ID') }),
    tags: ['admin', 'users', 'detail'],
    errorMessage: 'Failed to fetch user',
    errorStatus: 503,
});
