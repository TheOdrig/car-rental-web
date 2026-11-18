import { PAYMENT_ENDPOINTS, rentalPaymentSchema } from '@/entities/payment';
import { parseIdParam, proxy } from '@/shared/server';
import { parseUpstreamPayload } from '../../_lib/payment-response';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => PAYMENT_ENDPOINTS.byRental(parseIdParam(id, 'rental ID')),
    respond: (data) => parseUpstreamPayload(rentalPaymentSchema, data),
    errorMessage: 'Failed to fetch payment',
    errorStatus: 503,
});
