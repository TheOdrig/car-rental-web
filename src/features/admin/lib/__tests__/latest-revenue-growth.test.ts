import { describe, expect, it } from 'vitest';
import { latestRevenueGrowth } from '../utils';

const month = (currency: 'USD' | 'EUR', growthPercentage: number, label: string) =>
    ({ currency, growthPercentage, month: label }) as never;

describe('latestRevenueGrowth', () => {
    it('returns the latest month of the currency', () => {
        const rows = [month('USD', 1, 'a'), month('EUR', 5, 'b'), month('USD', 2, 'c')];
        expect(latestRevenueGrowth(rows, 'USD')).toMatchObject({ month: 'c' });
    });

    it('returns null without data or a finite growth', () => {
        expect(latestRevenueGrowth(undefined, 'USD')).toBeNull();
        expect(latestRevenueGrowth([month('USD', Number.NaN, 'a')], 'USD')).toBeNull();
    });
});
