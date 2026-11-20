import { describe, expect, it } from 'vitest';
import { paginate, parsePageIndex } from '../pagination';

describe('paginate', () => {
    const list = [1, 2, 3, 4, 5];

    it('slices the requested page', () => {
        expect(paginate(list, 1, 2)).toEqual({ items: [3, 4], totalPages: 3, currentPage: 1 });
    });

    it('clamps an out-of-range page to the last one', () => {
        expect(paginate(list, 9, 2)).toEqual({ items: [5], totalPages: 3, currentPage: 2 });
        expect(paginate(list, -1, 2).currentPage).toBe(0);
    });

    it('reports a single empty page for an empty list', () => {
        expect(paginate([], 0, 10)).toEqual({ items: [], totalPages: 1, currentPage: 0 });
    });
});

describe('parsePageIndex', () => {
    it('converts one-based params to zero-based indexes and rejects junk', () => {
        expect(parsePageIndex('3')).toBe(2);
        expect(parsePageIndex('1')).toBe(0);
        expect(parsePageIndex('0')).toBe(0);
        expect(parsePageIndex('abc')).toBe(0);
        expect(parsePageIndex(null)).toBe(0);
    });
});
