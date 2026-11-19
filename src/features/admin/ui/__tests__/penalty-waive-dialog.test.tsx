import { describe, it, expect } from 'vitest';
import { createWaiverSchema } from '../penalty-waive-dialog';

const reason = 'Customer was delayed by a documented breakdown';

describe('createWaiverSchema', () => {
    const schema = createWaiverSchema(1000.25, 'TRY');

    it('accepts a partial waiver within the penalty', () => {
        expect(schema.safeParse({ fullWaiver: false, waiverAmount: 500, reason }).success).toBe(true);
    });

    it('rejects a waiver amount above the penalty with a message', () => {
        const result = schema.safeParse({ fullWaiver: false, waiverAmount: 5000, reason });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('The waiver cannot be more than the penalty of ₺1,000.25');
    });

    it('requires an amount unless the whole penalty is waived', () => {
        expect(schema.safeParse({ fullWaiver: false, reason }).success).toBe(false);
        expect(schema.safeParse({ fullWaiver: true, reason }).success).toBe(true);
    });

    it('requires a reason of at least ten characters', () => {
        expect(schema.safeParse({ fullWaiver: true, reason: 'short' }).success).toBe(false);
    });
});
