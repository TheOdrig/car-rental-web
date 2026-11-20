import { describe, expect, it } from 'vitest';
import { isNumericId, parseNumericId } from '../numeric-id';
import { applyUrlPatch, urlStateHref } from '../url-state';

describe('applyUrlPatch', () => {
    it('sets, replaces and removes params while keeping the rest', () => {
        expect(applyUrlPatch('a=1&b=2', { b: 3, c: 'x' })).toBe('a=1&b=3&c=x');
        expect(applyUrlPatch(new URLSearchParams('a=1&b=2'), { a: null, b: undefined })).toBe('');
        expect(applyUrlPatch(null, { page: 0 })).toBe('page=0');
        expect(applyUrlPatch('a=1', { a: '' })).toBe('');
    });
});

describe('urlStateHref', () => {
    it('builds a relative or absolute href', () => {
        expect(urlStateHref('a=1')).toBe('?a=1');
        expect(urlStateHref('a=1', '/admin/damages')).toBe('/admin/damages?a=1');
        expect(urlStateHref('', '/admin/damages')).toBe('/admin/damages');
    });
});

describe('numeric ids', () => {
    it('accepts digit-only safe integers', () => {
        expect(isNumericId('42')).toBe(true);
        expect(isNumericId('4x')).toBe(false);
        expect(isNumericId('-1')).toBe(false);
        expect(isNumericId('99999999999999999999')).toBe(false);
    });

    it('parses a route param and yields NaN for invalid input', () => {
        expect(parseNumericId('7')).toBe(7);
        expect(parseNumericId(['8', '9'])).toBe(8);
        expect(parseNumericId('abc')).toBeNaN();
        expect(parseNumericId(undefined)).toBeNaN();
    });
});
