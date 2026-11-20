import { describe, it, expect } from 'vitest';
import { toPriceAdjustments } from '../price-adjustments';

describe('toPriceAdjustments', () => {
    it('keeps complete entries and drops incomplete ones', () => {
        expect(
            toPriceAdjustments([
                { code: 'WEEKEND', label: 'Weekend', amount: 11.3, multiplier: 1.113 },
                { code: 'BROKEN', label: 'No amount' },
                { label: 'No code', amount: 1 },
            ])
        ).toEqual([{ code: 'WEEKEND', label: 'Weekend', amount: 11.3, multiplier: 1.113 }]);
    });

    it('is empty when the API sends nothing', () => {
        expect(toPriceAdjustments(undefined)).toEqual([]);
        expect(toPriceAdjustments(null)).toEqual([]);
    });
});
