import type { z } from 'zod';
import { ApiError } from '@/shared/api/error';

export function parseUpstreamPayload<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new ApiError(502, 'Unexpected response from the payment service');
    }
    return result.data;
}
