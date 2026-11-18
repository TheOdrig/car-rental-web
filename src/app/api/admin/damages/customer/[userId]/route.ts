import { DAMAGE_ENDPOINTS } from '@/entities/damage';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ userId: string }>({
    path: ({ userId }) => DAMAGE_ENDPOINTS.admin.byCustomer(parseIdParam(userId, 'user ID')),
    forwardQuery: true,
    errorMessage: 'Failed to fetch customer damages',
});
