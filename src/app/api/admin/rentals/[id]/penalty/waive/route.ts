import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.penaltyWaive.resolve({ id: parseIdParam(id, 'rental ID') }),
    errorMessage: 'Failed to waive penalty',
    errorStatus: 503,
});
