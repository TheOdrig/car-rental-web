import { DAMAGE_ENDPOINTS } from '@/entities/damage';
import { parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ carId: string }>({
    path: ({ carId }) => DAMAGE_ENDPOINTS.admin.byVehicle(parseIdParam(carId, 'car ID')),
    forwardQuery: true,
    errorMessage: 'Failed to fetch vehicle damages',
});
