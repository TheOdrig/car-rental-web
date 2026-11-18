import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.admin.penaltyHistory.resolve({ id: parseIdParam(id, 'rental ID') }),
    errorMessage: 'Failed to fetch penalty history',
    errorStatus: 503,
});
