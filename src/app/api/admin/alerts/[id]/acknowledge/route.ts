import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.acknowledgeAlert.resolve({ id: parseIdParam(id, 'alert ID') }),
    body: 'none',
    errorMessage: 'Failed to acknowledge alert',
    errorStatus: 503,
});
