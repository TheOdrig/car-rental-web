import { describe, expect, it } from 'vitest';
import spec from '../../../../contract/openapi.json';
import {
    CAR_DATES_UNAVAILABLE_CODE,
    CAR_NOT_AVAILABLE_CODE,
    OPEN_RENTAL_REQUEST_LIMIT_CODE,
    PAYMENT_FAILED_CODE,
    PAYMENT_NOT_AUTHORIZED_CODE,
    PAYMENT_NOT_FOUND_CODE,
    RENTAL_CANCEL_NOT_ALLOWED_CODE,
    RENTAL_VALIDATION_FAILED_CODE,
    VALIDATION_FAILED_CODE,
} from '@/entities/rental';
import { PAYMENT_WINDOW_ERROR_CODES } from '@/features/pay-rental/lib/payment-errors';

const schemas = (spec as unknown as { components: { schemas: Record<string, { properties: Record<string, { enum?: string[] }> }> } })
    .components.schemas;
const contractCodes = schemas.ProblemDetail.properties.code.enum ?? [];

describe('error codes matched by the web exist in the API contract', () => {
    it('lists the codes the API can return', () => {
        expect(contractCodes.length).toBeGreaterThan(10);
    });

    it.each([
        CAR_DATES_UNAVAILABLE_CODE,
        CAR_NOT_AVAILABLE_CODE,
        OPEN_RENTAL_REQUEST_LIMIT_CODE,
        PAYMENT_FAILED_CODE,
        PAYMENT_NOT_AUTHORIZED_CODE,
        PAYMENT_NOT_FOUND_CODE,
        RENTAL_CANCEL_NOT_ALLOWED_CODE,
        RENTAL_VALIDATION_FAILED_CODE,
        VALIDATION_FAILED_CODE,
        'RATE_LIMIT_EXCEEDED',
        ...PAYMENT_WINDOW_ERROR_CODES,
    ])('%s is a contract code', (code) => {
        expect(contractCodes).toContain(code);
    });
});
