import { paymentIntentSchema } from '@/entities/payment';
import { API, parseIdParam, proxy } from '@/shared/server';
import { parseUpstreamPayload } from '../../_lib/payment-response';

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.rentals.paymentIntent.resolve({ id: parseIdParam(id, 'rental ID') }),
    body: 'none',
    respond: (data) => parseUpstreamPayload(paymentIntentSchema, data),
    errorMessage: 'Failed to start payment',
    errorStatus: 503,
});
