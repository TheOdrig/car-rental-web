import { API, parseIdParam, proxy } from '@/shared/server';

export const GET = proxy<{ carId: string }>({
    target: ({ carId }) => API.admin.damages.byVehicle.resolve({ carId: parseIdParam(carId, 'car ID') }),
    forwardQuery: true,
    errorMessage: 'Failed to fetch vehicle damages',
});
