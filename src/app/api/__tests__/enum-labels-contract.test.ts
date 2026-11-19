import { describe, expect, it } from 'vitest';
import spec from '../../../../contract/openapi.json';
import { AVAILABILITY_STATUS_LABELS, CAR_STATUS_LABELS } from '@/entities/car';
import { PAYMENT_STATUS_LABELS } from '@/entities/payment';
import { LATE_RETURN_STATUS_LABELS, RENTAL_STATUS_LABELS } from '@/entities/rental';

type Schemas = Record<string, { properties?: Record<string, { enum?: string[] }> }>;
const schemas = (spec as unknown as { components: { schemas: Schemas } }).components.schemas;

function codes(schema: string, property: string): string[] {
    return schemas[schema].properties?.[property]?.enum ?? [];
}

describe('every enum code in the contract has a web label', () => {
    it.each([
        ['RentalResponse.status', codes('RentalResponse', 'status'), RENTAL_STATUS_LABELS],
        ['CarResponse.carStatusType', codes('CarResponse', 'carStatusType'), CAR_STATUS_LABELS],
        ['CarStatusUpdateRequest.carStatusType', codes('CarStatusUpdateRequest', 'carStatusType'), CAR_STATUS_LABELS],
        ['DayAvailabilityDto.status', codes('DayAvailabilityDto', 'status'), AVAILABILITY_STATUS_LABELS],
        ['PaymentSummary.status', codes('PaymentSummary', 'status'), PAYMENT_STATUS_LABELS],
        ['LateReturnReportDto.status', codes('LateReturnReportDto', 'status'), LATE_RETURN_STATUS_LABELS],
    ])('%s', (_name, contractCodes, labels) => {
        expect(contractCodes.length).toBeGreaterThan(1);
        expect(Object.keys(labels).sort()).toEqual([...contractCodes].sort());
        for (const label of Object.values(labels)) {
            expect(label).not.toMatch(/^[A-Z_]+$/);
        }
    });
});
