import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.damages.byId.resolve({ id: parseIdParam(id, 'damage ID') }),
    errorMessage: 'Failed to fetch the damage report',
});
