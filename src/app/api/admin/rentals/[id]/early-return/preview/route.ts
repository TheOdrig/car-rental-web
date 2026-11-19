import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.admin.earlyReturnPreview.resolve({ id: parseIdParam(id, 'rental ID') }),
    errorMessage: 'Failed to preview the early return',
    errorStatus: 503,
});
