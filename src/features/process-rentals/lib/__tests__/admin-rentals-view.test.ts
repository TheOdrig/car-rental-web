import { describe, expect, it } from 'vitest';
import {
    buildAdminRentalsQuery,
    describeEmptyQueues,
    parseAdminRentalsParams,
    queueCount,
} from '../admin-rentals-view';

const parse = (query: string) => parseAdminRentalsParams(new URLSearchParams(query));

describe('parseAdminRentalsParams', () => {
    it('defaults to the pending view without filters', () => {
        expect(parse('')).toEqual({ userId: undefined, view: 'pending', rentalStatus: 'all', page: 0, queue: 'all' });
        expect(parseAdminRentalsParams(null).view).toBe('pending');
    });

    it('opens the all-rentals view for a customer or view=all', () => {
        expect(parse('userId=42').view).toBe('all-rentals');
        expect(parse('userId=42').userId).toBe(42);
        expect(parse('view=all').view).toBe('all-rentals');
    });

    it('ignores invalid user ids, statuses and queues', () => {
        expect(parse('userId=4x2').userId).toBeUndefined();
        expect(parse('status=BOGUS').rentalStatus).toBe('all');
        expect(parse('queue=bogus').queue).toBe('all');
        expect(parse('status=IN_USE').rentalStatus).toBe('IN_USE');
        expect(parse('queue=overdue').queue).toBe('overdue');
    });
});

describe('buildAdminRentalsQuery', () => {
    it('round-trips the state it parses', () => {
        expect(buildAdminRentalsQuery(parse(''))).toBe('');
        expect(buildAdminRentalsQuery(parse('view=all&status=IN_USE&page=3'))).toBe('view=all&status=IN_USE&page=3');
        expect(buildAdminRentalsQuery(parse('userId=7'))).toBe('userId=7');
        expect(buildAdminRentalsQuery(parse('queue=pickups'))).toBe('queue=pickups');
    });

    it('drops view-specific params from the other view', () => {
        expect(buildAdminRentalsQuery({ userId: undefined, view: 'pending', rentalStatus: 'IN_USE', page: 4, queue: 'returns' })).toBe('queue=returns');
    });
});

describe('queue helpers', () => {
    it('prefers the server total over the loaded page length', () => {
        expect(queueCount({ totalElements: 12, content: [1] })).toBe(12);
        expect(queueCount({ content: [1, 2] })).toBe(2);
        expect(queueCount(undefined)).toBe(0);
    });

    it('joins empty queue nouns with a final "or"', () => {
        expect(describeEmptyQueues(['approvals'])).toBe('approvals');
        expect(describeEmptyQueues(['approvals', 'pickups', 'returns'])).toBe('approvals, pickups or returns');
    });
});
