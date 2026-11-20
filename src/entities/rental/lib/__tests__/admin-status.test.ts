import { describe, expect, it } from 'vitest';
import { isAdminPaymentExpected, isAwaitingPickup, isPenaltyHistoryStatus } from '../admin-status';

describe('admin status rules', () => {
    it('expects payment only once a rental is confirmed or beyond', () => {
        expect(isAdminPaymentExpected('CONFIRMED')).toBe(true);
        expect(isAdminPaymentExpected('ACTIVE')).toBe(true);
        expect(isAdminPaymentExpected('COMPLETED')).toBe(true);
        expect(isAdminPaymentExpected('PENDING')).toBe(false);
        expect(isAdminPaymentExpected('CANCELLED')).toBe(false);
        expect(isAdminPaymentExpected('UNKNOWN')).toBe(false);
        expect(isAdminPaymentExpected(undefined)).toBe(false);
    });

    it('awaits pickup only when confirmed', () => {
        expect(isAwaitingPickup('CONFIRMED')).toBe(true);
        expect(isAwaitingPickup('ACTIVE')).toBe(false);
    });

    it('keeps penalty history for active and completed rentals', () => {
        expect(isPenaltyHistoryStatus('ACTIVE')).toBe(true);
        expect(isPenaltyHistoryStatus('COMPLETED')).toBe(true);
        expect(isPenaltyHistoryStatus('PENDING')).toBe(false);
    });
});
