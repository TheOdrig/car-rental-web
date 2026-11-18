import { API, parseIdParam, proxy } from '@/shared/server';
import { mapRentalStatusQuery } from '../../../_lib/rental-status-query';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.admin.users.rentals.resolve({ id: parseIdParam(id, 'user ID') }),
    forwardQuery: true,
    transformQuery: mapRentalStatusQuery,
    errorMessage: 'Failed to fetch customer rentals',
    errorStatus: 503,
});
