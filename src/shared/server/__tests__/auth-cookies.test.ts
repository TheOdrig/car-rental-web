import { describe, it, expect, vi } from 'vitest';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));

import { buildAuthCookies, mergeCookieHeader, resolveAccessMaxAge } from '../auth-cookies';

describe('resolveAccessMaxAge', () => {
    const now = 1_700_000_000_000;

    it('treats small values as relative seconds', () => {
        expect(resolveAccessMaxAge(3600, now)).toBe(3600);
    });

    it('treats epoch seconds as an absolute expiry', () => {
        expect(resolveAccessMaxAge(1_700_000_900, now)).toBe(900);
    });

    it('treats epoch milliseconds as an absolute expiry', () => {
        expect(resolveAccessMaxAge(now + 600_000, now)).toBe(600);
    });

    it('falls back to 15 minutes for missing, invalid or past values', () => {
        expect(resolveAccessMaxAge(undefined, now)).toBe(900);
        expect(resolveAccessMaxAge(Number.NaN, now)).toBe(900);
        expect(resolveAccessMaxAge(now - 1000, now)).toBe(900);
        expect(resolveAccessMaxAge(0, now)).toBe(900);
    });
});

describe('buildAuthCookies', () => {
    it('builds httpOnly lax cookies with distinct lifetimes', () => {
        const [access, refresh] = buildAuthCookies({ accessToken: 'a', refreshToken: 'r', expiresIn: 1200 });

        expect(access).toMatchObject({ name: 'access_token', value: 'a' });
        expect(access.options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 1200 });
        expect(refresh).toMatchObject({ name: 'refresh_token', value: 'r' });
        expect(refresh.options.maxAge).toBe(60 * 60 * 24 * 7);
    });
});

describe('mergeCookieHeader', () => {
    it('replaces auth cookies and keeps the others', () => {
        const merged = mergeCookieHeader('theme=dark; access_token=old; refresh_token=old2', [
            { name: 'access_token', value: 'new' },
            { name: 'refresh_token', value: 'new2' },
        ]);

        expect(merged).toBe('theme=dark; access_token=new; refresh_token=new2');
    });

    it('handles an empty header', () => {
        expect(mergeCookieHeader(null, [{ name: 'access_token', value: 'x' }])).toBe('access_token=x');
    });
});
