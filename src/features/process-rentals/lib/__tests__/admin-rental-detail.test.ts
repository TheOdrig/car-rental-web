import { describe, expect, it } from 'vitest';
import {
    findTimelineTimestamp,
    getPickupBlockedReason,
    hasPenalty,
    isPaymentExpected,
    shouldShowPenaltyHistory,
    toTimelineEvents,
    toVehicleInfo,
} from '../admin-rental-detail';
import { PICKUP_PAYMENT_REQUIRED_MESSAGE } from '@/entities/rental';

const dayMs = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * dayMs).toISOString().slice(0, 10);

describe('isPaymentExpected', () => {
    it.each(['CONFIRMED', 'ACTIVE', 'COMPLETED'])('expects payment for %s', (status) => {
        expect(isPaymentExpected(status)).toBe(true);
    });

    it.each(['PENDING', 'CANCELLED', 'UNKNOWN', undefined])('does not expect payment for %s', (status) => {
        expect(isPaymentExpected(status)).toBe(false);
    });
});

describe('penalty rules', () => {
    it('detects a positive penalty only', () => {
        expect(hasPenalty({ penaltyAmount: 10 })).toBe(true);
        expect(hasPenalty({ penaltyAmount: 0 })).toBe(false);
        expect(hasPenalty({ penaltyAmount: undefined })).toBe(false);
    });

    it('shows history only for active or completed rentals without a penalty', () => {
        expect(shouldShowPenaltyHistory({ penaltyAmount: 0, status: 'COMPLETED' })).toBe(true);
        expect(shouldShowPenaltyHistory({ penaltyAmount: 0, status: 'PENDING' })).toBe(false);
        expect(shouldShowPenaltyHistory({ penaltyAmount: 5, status: 'ACTIVE' })).toBe(false);
    });
});

describe('getPickupBlockedReason', () => {
    const dates = { startDate: iso(-1), endDate: iso(3) };

    it('does not block non-confirmed rentals', () => {
        expect(getPickupBlockedReason({ status: 'ACTIVE', ...dates }, { isLoading: false, status: undefined })).toBeUndefined();
    });

    it('blocks until the payment is secured', () => {
        expect(getPickupBlockedReason({ status: 'CONFIRMED', ...dates }, { isLoading: false, status: 'PENDING' })).toBe(
            PICKUP_PAYMENT_REQUIRED_MESSAGE,
        );
        expect(getPickupBlockedReason({ status: 'CONFIRMED', ...dates }, { isLoading: true, status: undefined })).toBeUndefined();
        expect(getPickupBlockedReason({ status: 'CONFIRMED', ...dates }, { isLoading: false, status: 'AUTHORIZED' })).toBeUndefined();
    });

    it('blocks pickup before the start date', () => {
        expect(
            getPickupBlockedReason({ status: 'CONFIRMED', startDate: iso(5), endDate: iso(8) }, { isLoading: false, status: 'AUTHORIZED' }),
        ).toBeDefined();
    });
});

describe('view model mapping', () => {
    it('names the vehicle and falls back on timeline copy', () => {
        expect(toVehicleInfo({ brand: 'Audi', model: 'A4' } as never).name).toBe('Audi A4');
        const events = toTimelineEvents([{ type: 'created', title: '', description: '', timestamp: 't' }] as never);
        expect(events[0]).toMatchObject({ id: 0, title: 'Status Update', description: '' });
        expect(findTimelineTimestamp([{ type: 'created', timestamp: 't' }] as never, 'created')).toBe('t');
        expect(findTimelineTimestamp([], 'created')).toBeUndefined();
    });
});
