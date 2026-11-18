import { rentalPaymentSchema } from '@/entities/payment';
import { API, parseIdParam, proxy } from '@/shared/server';
import { parseUpstreamPayload } from '../../_lib/payment-response';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.rentals.payment.resolve({ id: parseIdParam(id, 'rental ID') }),
    respond: (data) => parseUpstreamPayload(rentalPaymentSchema, data),
    errorMessage: 'Failed to fetch payment',
    errorStatus: 503,
});
