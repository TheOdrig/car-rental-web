import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.users.unban.resolve({ id: parseIdParam(id, 'user ID') }),
    body: 'optional',
    respond: () => ({ success: true }),
    errorMessage: 'Failed to unban user',
    errorStatus: 503,
});
