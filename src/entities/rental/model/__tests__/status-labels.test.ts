import { describe, expect, it } from 'vitest';
import {
    ADMIN_RENTAL_STATUS_LABELS,
    LATE_RETURN_STATUS_LABELS,
    RENTAL_STATUS_LABELS,
    RentalStatus,
    toAdminRentalStatus,
    toApiRentalStatus,
} from '@/entities/rental';

describe('rental status codes and labels', () => {
    it('uses the API codes on the wire', () => {
        expect(Object.values(RentalStatus)).toEqual(['REQUESTED', 'CONFIRMED', 'IN_USE', 'RETURNED', 'CANCELLED']);
    });

    it('labels every code for display', () => {
        expect(RENTAL_STATUS_LABELS[RentalStatus.IN_USE]).toBe('In use');
        expect(RENTAL_STATUS_LABELS[RentalStatus.RETURNED]).toBe('Returned');
        expect(LATE_RETURN_STATUS_LABELS.SEVERELY_LATE).toBe('Severely late');
        expect(ADMIN_RENTAL_STATUS_LABELS.ACTIVE).toBe('In use');
        expect(ADMIN_RENTAL_STATUS_LABELS.COMPLETED).toBe('Returned');
        expect(ADMIN_RENTAL_STATUS_LABELS.PENDING).toBe('Requested');
    });

    it('maps between the API codes and the admin vocabulary', () => {
        expect(toAdminRentalStatus('IN_USE')).toBe('ACTIVE');
        expect(toAdminRentalStatus('RETURNED')).toBe('COMPLETED');
        expect(toAdminRentalStatus('REQUESTED')).toBe('PENDING');
        expect(toApiRentalStatus('ACTIVE')).toBe('IN_USE');
        expect(toApiRentalStatus('COMPLETED')).toBe('RETURNED');
        expect(toApiRentalStatus('REJECTED')).toBe('CANCELLED');
        expect(toApiRentalStatus('IN_USE')).toBe('IN_USE');
    });
});
