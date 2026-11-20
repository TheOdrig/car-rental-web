import { describe, expect, it } from 'vitest';
import {
    RentalStatus,
    adminRentalStatusPresentation,
    lateReturnStatusPresentation,
    rentalStatusPresentation,
    toAdminRentalStatus,
} from '@/entities/rental';

describe('rental status presentation', () => {
    it('gives every API status one label and tone', () => {
        expect(rentalStatusPresentation(RentalStatus.REQUESTED)).toEqual({ label: 'Requested', tone: 'warning' });
        expect(rentalStatusPresentation(RentalStatus.CONFIRMED)).toEqual({ label: 'Confirmed', tone: 'info' });
        expect(rentalStatusPresentation(RentalStatus.IN_USE)).toEqual({ label: 'In use', tone: 'success' });
        expect(rentalStatusPresentation(RentalStatus.RETURNED)).toEqual({ label: 'Returned', tone: 'neutral' });
        expect(rentalStatusPresentation(RentalStatus.CANCELLED)).toEqual({ label: 'Cancelled', tone: 'danger' });
    });

    it('shows an unrecognised status as neutral with its own text', () => {
        expect(rentalStatusPresentation('SOMETHING_NEW')).toEqual({ label: 'SOMETHING_NEW', tone: 'neutral' });
        expect(rentalStatusPresentation(undefined)).toEqual({ label: 'Unknown', tone: 'neutral' });
    });

    it('keeps the admin vocabulary on the same tones', () => {
        for (const status of Object.values(RentalStatus)) {
            expect(adminRentalStatusPresentation(toAdminRentalStatus(status))).toEqual(rentalStatusPresentation(status));
        }
        expect(adminRentalStatusPresentation('UNKNOWN')).toEqual({ label: 'Unknown', tone: 'neutral' });
    });

    it('tones late returns by severity', () => {
        expect(lateReturnStatusPresentation('ON_TIME').tone).toBe('success');
        expect(lateReturnStatusPresentation('GRACE_PERIOD').tone).toBe('warning');
        expect(lateReturnStatusPresentation('SEVERELY_LATE')).toEqual({ label: 'Severely late', tone: 'danger' });
    });
});

describe('late return and admin status fallbacks', () => {
    it('falls back to neutral for null, undefined and unknown values', async () => {
        const { lateReturnStatusPresentation, adminRentalStatusPresentation } = await import('../status-presentation');
        expect(lateReturnStatusPresentation(null)).toEqual({ label: 'Unknown', tone: 'neutral' });
        expect(lateReturnStatusPresentation('MISSING')).toEqual({ label: 'MISSING', tone: 'neutral' });
        expect(adminRentalStatusPresentation(undefined)).toEqual({ label: 'Unknown', tone: 'neutral' });
    });
});

describe('pendingItemStatusPresentation', () => {
    it('shows an Overdue danger badge for the overdue queue', async () => {
        const { pendingItemStatusPresentation } = await import('../status-presentation');
        expect(pendingItemStatusPresentation('IN_USE', true)).toEqual({ label: 'Overdue', tone: 'danger' });
    });

    it('normalises case and understands API and admin codes', async () => {
        const { pendingItemStatusPresentation } = await import('../status-presentation');
        expect(pendingItemStatusPresentation('requested').label).toBe('Requested');
        expect(pendingItemStatusPresentation(' in_use ').label).toBe('In use');
        expect(pendingItemStatusPresentation('pending').tone).toBe('warning');
    });

    it('falls back to neutral text for unknown or missing status', async () => {
        const { pendingItemStatusPresentation } = await import('../status-presentation');
        expect(pendingItemStatusPresentation('WEIRD')).toEqual({ label: 'WEIRD', tone: 'neutral' });
        expect(pendingItemStatusPresentation(undefined)).toEqual({ label: 'Unknown', tone: 'neutral' });
    });
});
