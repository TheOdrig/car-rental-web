import { describe, expect, it } from 'vitest';
import { ownValue } from '@/shared/lib/utils';
import { toLateReturnStatus } from '@/app/api/admin/_lib/late-return-status';
import { toAdminRentalStatus, toApiRentalStatus } from '@/entities/rental/lib/admin-status';
import { getStatusDisplay } from '@/features/process-rentals/ui/pending-rentals/format';

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
        expect(toLateReturnStatus(key)).toBeUndefined();
        expect(toAdminRentalStatus(key)).toBe('PENDING');
        expect(toApiRentalStatus(key)).toBe(key);
        expect(getStatusDisplay(key).label).toBe(key);
    });
});
