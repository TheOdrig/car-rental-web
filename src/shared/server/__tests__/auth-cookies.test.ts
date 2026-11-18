import { describe, it, expect, vi } from 'vitest';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));

import { buildAuthCookies, mergeCookieHeader, resolveAccessMaxAge } from '../auth-cookies';

describe('resolveAccessMaxAge', () => {
    it('uses expiresIn as relative seconds', () => {
        expect(resolveAccessMaxAge(900)).toBe(900);
        expect(resolveAccessMaxAge(3600)).toBe(3600);
    });

    it('floors fractional seconds', () => {
        expect(resolveAccessMaxAge(899.9)).toBe(899);
    });

    it('falls back to 15 minutes for missing, invalid or non-positive values', () => {
        expect(resolveAccessMaxAge(undefined)).toBe(900);
        expect(resolveAccessMaxAge(Number.NaN)).toBe(900);
        expect(resolveAccessMaxAge(-5)).toBe(900);
        expect(resolveAccessMaxAge(0)).toBe(900);
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
