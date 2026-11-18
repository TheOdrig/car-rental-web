import { DAMAGE_ENDPOINTS } from '@/entities/damage';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => DAMAGE_ENDPOINTS.admin.assess(parseIdParam(id, 'damage ID')),
    method: 'POST',
    errorMessage: 'Failed to assess damage',
});
