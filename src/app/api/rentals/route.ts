import { API, proxy } from '@/shared/server';

export const POST = proxy({
    target: () => API.rentals.request.resolve(),
    status: 201,
    errorMessage: 'Failed to create rental request',
    errorStatus: 503,
});
