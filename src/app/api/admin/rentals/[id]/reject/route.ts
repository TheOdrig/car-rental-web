import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.quickActions.reject.resolve({ id: parseIdParam(id, 'rental ID') }),
    body: 'optional',
    errorMessage: 'Failed to reject rental',
    errorStatus: 503,
});
