import { describe, expect, it } from 'vitest';
import { AVAILABILITY_STATUS_LABELS, CAR_SERVICE_STATUS_LABELS, CAR_STATUS_LABELS, CAR_STATUSES, carServiceStatusLabel, carStatusLabel } from '../status-labels';

describe('car status labels', () => {
    it('labels each status code', () => {
        expect(CAR_STATUS_LABELS.AVAILABLE).toBe('Available');
        expect(CAR_STATUS_LABELS.MAINTENANCE).toBe('Maintenance');
        expect(CAR_STATUSES).toEqual(['AVAILABLE', 'MAINTENANCE', 'DAMAGED', 'INSPECTION']);
    });

    it('labels the admin service status without claiming availability', () => {
        expect(CAR_SERVICE_STATUS_LABELS.AVAILABLE).toBe('In service');
        expect(CAR_SERVICE_STATUS_LABELS.DAMAGED).toBe(CAR_STATUS_LABELS.DAMAGED);
        expect(carServiceStatusLabel('AVAILABLE')).toBe('In service');
        expect(carServiceStatusLabel('RENTED')).toBe('RENTED');
        expect(carServiceStatusLabel(null)).toBe('');
    });

    it('shows an unavailable calendar day as booked', () => {
        expect(AVAILABILITY_STATUS_LABELS.UNAVAILABLE).toBe('Booked');
        expect(AVAILABILITY_STATUS_LABELS.AVAILABLE).toBe('Available');
    });

    it('falls back to the raw value for an unknown or inherited key', () => {
        expect(carStatusLabel('INSPECTION')).toBe('Inspection');
        expect(carStatusLabel('RENTED')).toBe('RENTED');
        expect(carStatusLabel('constructor')).toBe('constructor');
        expect(carStatusLabel(undefined)).toBe('');
    });
});
