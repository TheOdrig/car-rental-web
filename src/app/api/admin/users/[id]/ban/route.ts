import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.users.ban.resolve({ id: parseIdParam(id, 'user ID') }),
    respond: () => ({ success: true }),
    errorMessage: 'Failed to ban user',
    errorStatus: 503,
});
