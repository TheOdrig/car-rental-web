import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.damages.charge.resolve({ id: parseIdParam(id, 'damage ID') }),
    body: 'none',
    errorMessage: 'Failed to charge damage',
});
