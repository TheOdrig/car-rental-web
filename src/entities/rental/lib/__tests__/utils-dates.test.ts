import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { RentalStatus, type Rental } from '@/entities/rental';
import { getRentalsByTab, calculateTabCounts, isUpcomingRental } from '../utils';

const originalTz = process.env.TZ;

function confirmedStarting(startDate: string): Rental {
    return {
        id: 1,
        startDate,
        endDate: '2030-01-10',
        totalPrice: 10,
        status: RentalStatus.CONFIRMED,
    } as unknown as Rental;
}

describe('rental date-only handling west of UTC', () => {
    beforeAll(() => {
        process.env.TZ = 'America/Los_Angeles';
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2024, 2, 4, 12, 0, 0));
    });

    afterAll(() => {
        vi.useRealTimers();
        if (originalTz === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = originalTz;
        }
    });

    it('treats a rental starting tomorrow as upcoming', () => {
        const rental = confirmedStarting('2024-03-05');

        expect(isUpcomingRental(rental)).toBe(true);
        expect(getRentalsByTab([rental], 'upcoming')).toHaveLength(1);
        expect(calculateTabCounts([rental]).upcoming).toBe(1);
    });

    it('does not treat a rental starting today as upcoming', () => {
        const rental = confirmedStarting('2024-03-04');

        expect(isUpcomingRental(rental)).toBe(false);
        expect(calculateTabCounts([rental]).upcoming).toBe(0);
    });
});
