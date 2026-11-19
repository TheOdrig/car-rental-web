import { describe, it, expect } from 'vitest';
import { getPasswordMaxError, normalizeEmail, validatePassword } from '../validation';

describe('password upper limits', () => {
    it('accepts 72 ASCII characters and rejects 73', () => {
        expect(getPasswordMaxError('a'.repeat(72))).toBeNull();
        expect(getPasswordMaxError('a'.repeat(73))).toMatch(/at most 72 characters/);
    });

    it('counts UTF-8 bytes, not only characters', () => {
        expect(getPasswordMaxError('ü'.repeat(36))).toBeNull();
        expect(getPasswordMaxError('ü'.repeat(37))).toMatch(/72 bytes/);
        expect(getPasswordMaxError('€'.repeat(25))).toMatch(/72 bytes/);
    });

    it('keeps the minimum of 8 and applies the maximum in validatePassword', () => {
        expect(validatePassword('1234567')).toBe(false);
        expect(validatePassword('12345678')).toBe(true);
        expect(validatePassword('a'.repeat(73))).toBe(false);
    });
});

describe('normalizeEmail', () => {
    it('trims and lowercases', () => {
        expect(normalizeEmail('  John.Doe@Example.COM ')).toBe('john.doe@example.com');
    });
});
