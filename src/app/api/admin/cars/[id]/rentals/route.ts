import { API, parseIdParam, proxy } from '@/shared/server';
import { mapRentalStatusQuery } from '../../../_lib/rental-status-query';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.admin.carRentals.resolve({ id: parseIdParam(id, 'car ID') }),
    forwardQuery: true,
    transformQuery: mapRentalStatusQuery,
    errorMessage: 'Failed to fetch vehicle rentals',
    errorStatus: 503,
});
