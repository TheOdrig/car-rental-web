import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.damages.dispute.resolve({ id: parseIdParam(id, 'damage ID') }),
    status: 201,
    errorMessage: 'Failed to submit dispute',
});
