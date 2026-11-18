import { DAMAGE_ENDPOINTS } from '@/entities/damage';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => DAMAGE_ENDPOINTS.admin.byId(parseIdParam(id, 'damage ID')),
    errorMessage: 'Failed to fetch damage report',
});
