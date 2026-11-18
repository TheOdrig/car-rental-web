import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from '../safe-redirect';

const BACKSLASH = String.fromCharCode(92);

describe('safeRedirectPath', () => {
    it('keeps same-origin paths with query and hash', () => {
        expect(safeRedirectPath('/cars/5?tab=a#x')).toBe('/cars/5?tab=a#x');
        expect(safeRedirectPath('/')).toBe('/');
    });

    it.each([
        'https://evil.example',
        '//evil.example',
        `/${BACKSLASH}evil.example`,
        `${BACKSLASH}${BACKSLASH}evil.example`,
        'javascript:alert(1)',
        'evil.example',
        '/\t/evil.example',
        '',
    ])('falls back to / for %j', (value) => {
        expect(safeRedirectPath(value)).toBe('/');
    });

    it('falls back for missing or non-string values', () => {
        expect(safeRedirectPath(undefined)).toBe('/');
        expect(safeRedirectPath(null)).toBe('/');
        expect(safeRedirectPath(['/a', '/b'])).toBe('/');
    });
});
