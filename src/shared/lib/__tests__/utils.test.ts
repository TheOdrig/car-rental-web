import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, safeJSONParse, cn } from '@/shared/lib';
describe('Shared Utilities', () => {
    describe('formatCurrency', () => {
        it('should format USD correctly', () => {
            expect(formatCurrency(100)).toBe('$100.00');
            expect(formatCurrency(1234.56)).toBe('$1,234.56');
        });
        it('should handle other currencies', () => {
            expect(formatCurrency(100, 'EUR')).toBe('€100.00');
        });
    });
    describe('formatDate', () => {
        it('should format date string correctly', () => {
            const date = '2023-12-25';
            expect(formatDate(date)).toBe('Dec 25, 2023');
        });
    });
    describe('safeJSONParse', () => {
        it('should parse valid JSON', () => {
            const json = '{"key":"value"}';
            expect(safeJSONParse(json, {})).toEqual({ key: 'value' });
        });
        it('should return fallback for invalid JSON', () => {
            const json = 'invalid';
            const fallback = { error: true };
            expect(safeJSONParse(json, fallback)).toEqual(fallback);
        });
    });
    describe('cn (classnames)', () => {
        it('should merge classes correctly', () => {
            expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
        });
        it('should handle conditional classes', () => {
            expect(cn('p-4', false, 'text-center')).toBe('p-4 text-center');
        });
        it('should merge tailwind classes properly', () => {
            expect(cn('p-4 p-2')).toBe('p-2');
        });
    });
});