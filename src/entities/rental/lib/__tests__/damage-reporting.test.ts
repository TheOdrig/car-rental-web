import { describe, it, expect } from 'vitest';
import { canReportDamage } from '../damage-reporting';

const now = new Date('2026-11-20T12:00:00Z');

describe('canReportDamage', () => {
    it('allows rentals that are in use', () => {
        expect(canReportDamage('ACTIVE', undefined, now)).toBe(true);
        expect(canReportDamage('OVERDUE', undefined, now)).toBe(true);
    });

    it('allows a returned rental for seven days after the return', () => {
        expect(canReportDamage('COMPLETED', '2026-11-14T12:00:00Z', now)).toBe(true);
        expect(canReportDamage('COMPLETED', '2026-11-13T11:59:00Z', now)).toBe(false);
    });

    it('leaves the decision to the API when the return time is unknown', () => {
        expect(canReportDamage('COMPLETED', undefined, now)).toBe(true);
    });

    it('never offers it before pickup or after a cancellation', () => {
        for (const status of ['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED'] as const) {
            expect(canReportDamage(status, undefined, now)).toBe(false);
        }
    });
});
