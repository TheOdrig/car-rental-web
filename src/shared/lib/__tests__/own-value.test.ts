import { describe, expect, it } from 'vitest';
import { ownValue } from '@/shared/lib/utils';
import { rentalStatusPresentation } from '@/entities/rental/model/status-presentation';
import { toAdminRentalStatus, toApiRentalStatus } from '@/entities/rental/lib/admin-status';

const inherited = ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf'];

describe('ownValue', () => {
    it('returns own entries only', () => {
        const map = { a: 1 };

        expect(ownValue(map, 'a')).toBe(1);
        expect(ownValue(map, 'b')).toBeUndefined();
        expect(ownValue(map, undefined)).toBeUndefined();
        expect(ownValue(map, null)).toBeUndefined();
    });

    it.each(inherited)('ignores the inherited key %s', (key) => {
        expect(ownValue({ a: 1 }, key)).toBeUndefined();
    });
});

describe('status lookups with inherited keys', () => {
    it.each(inherited)('%s is not a known status', (key) => {
        expect(toAdminRentalStatus(key)).toBe('UNKNOWN');
        expect(toApiRentalStatus(key)).toBe(key);
        expect(rentalStatusPresentation(key).label).toBe(key);
    });
});
