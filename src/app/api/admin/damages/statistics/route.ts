import { proxy } from '@/shared/server';
import { DAMAGE_ENDPOINTS } from '@/entities/damage';

export const GET = proxy({
    path: () => DAMAGE_ENDPOINTS.admin.statistics,
    forwardQuery: true,
    errorMessage: 'Failed to fetch damage statistics',
});
