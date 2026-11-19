import { describe, it, expect } from 'vitest';
import { formatCompactCurrency, getCurrencySymbol } from '@/shared/lib';

describe('formatCompactCurrency', () => {
    it('abbreviates large amounts in the given currency', () => {
        expect(formatCompactCurrency(12500, 'USD')).toBe('$12.5K');
        expect(formatCompactCurrency(12500, 'EUR')).toBe('€12.5K');
    });

    it('keeps small amounts whole', () => {
        expect(formatCompactCurrency(750, 'GBP')).toBe('£750');
    });
});

describe('getCurrencySymbol', () => {
    it('returns the narrow symbol of the currency', () => {
        expect(getCurrencySymbol('USD')).toBe('$');
        expect(getCurrencySymbol('EUR')).toBe('€');
        expect(getCurrencySymbol('TRY')).toBe('₺');
    });
});
