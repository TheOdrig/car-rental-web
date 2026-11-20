import { describe, it, expect } from 'vitest';
import { buildRentalDetail } from '../rental-detail';

describe('buildRentalDetail timeline', () => {
    it('keeps the real timestamp of every milestone', () => {
        const detail = buildRentalDetail({
            rental: {
                id: 9,
                status: 'RETURNED',
                createTime: '2030-01-01T08:00:00Z',
                updateTime: '2030-01-05T10:00:00Z',
                confirmedAt: '2030-01-02T09:00:00Z',
                pickedUpAt: '2030-01-03T10:00:00Z',
                returnedAt: '2030-01-04T11:00:00Z',
            },
        });

        expect(detail.timeline.map((event) => [event.type, event.timestamp])).toEqual([
            ['created', '2030-01-01T08:00:00Z'],
            ['approved', '2030-01-02T09:00:00Z'],
            ['picked_up', '2030-01-03T10:00:00Z'],
            ['returned', '2030-01-04T11:00:00Z'],
        ]);
    });

    it('falls back to the update time for the current stage of older rentals', () => {
        const detail = buildRentalDetail({
            rental: { id: 9, status: 'IN_USE', createTime: '2030-01-01T08:00:00Z', updateTime: '2030-01-03T10:00:00Z' },
        });

        expect(detail.timeline.map((event) => event.timestamp)).toEqual(['2030-01-01T08:00:00Z', '', '2030-01-03T10:00:00Z']);
    });
});
