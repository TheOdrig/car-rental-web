import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ userId: string }>({
    target: ({ userId }) => API.admin.damages.byCustomer.resolve({ userId: parseIdParam(userId, 'user ID') }),
    forwardQuery: true,
    errorMessage: 'Failed to fetch customer damages',
});
