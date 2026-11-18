import { API, parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.damages.assess.resolve({ id: parseIdParam(id, 'damage ID') }),
    errorMessage: 'Failed to assess damage',
});
