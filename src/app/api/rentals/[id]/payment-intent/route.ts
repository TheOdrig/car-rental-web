import { PAYMENT_ENDPOINTS, paymentIntentSchema } from '@/entities/payment';
import { parseIdParam, proxy } from '@/shared/server';
import { parseUpstreamPayload } from '../../_lib/payment-response';

export const POST = proxy<{ id: string }>({
    path: ({ id }) => PAYMENT_ENDPOINTS.intent(parseIdParam(id, 'rental ID')),
    method: 'POST',
    body: 'none',
    respond: (data) => parseUpstreamPayload(paymentIntentSchema, data),
    errorMessage: 'Failed to start payment',
    errorStatus: 503,
});
