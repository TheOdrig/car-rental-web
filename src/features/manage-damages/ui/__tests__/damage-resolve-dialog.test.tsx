import { describe, it, expect } from 'vitest';
import { createResolveSchema } from '../damage-resolve-dialog';

const base = { adjustedRepairCost: 3000, resolutionNotes: 'Refund the difference' };

describe('createResolveSchema', () => {
    const schema = createResolveSchema(3000, 'JPY');

    it('accepts a liability at or below the charged amount', () => {
        expect(schema.safeParse({ ...base, adjustedCustomerLiability: 1500 }).success).toBe(true);
        expect(schema.safeParse({ ...base, adjustedCustomerLiability: 3000 }).success).toBe(true);
    });

    it('rejects raising the liability above what was charged', () => {
        const result = schema.safeParse({ ...base, adjustedCustomerLiability: 5000 });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('The liability cannot be raised above the charged ¥3,000');
    });

    it('does not cap the liability when the charged amount is unknown', () => {
        expect(createResolveSchema(undefined, 'USD').safeParse({ ...base, adjustedCustomerLiability: 9999 }).success).toBe(true);
    });
});
