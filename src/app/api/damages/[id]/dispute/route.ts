import { DAMAGE_ENDPOINTS } from '@/entities/damage';
import { parseIdParam, proxy } from '@/shared/server';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => DAMAGE_ENDPOINTS.dispute(parseIdParam(id, 'damage ID')),
    method: 'POST',
    status: 201,
    errorMessage: 'Failed to submit dispute',
});
