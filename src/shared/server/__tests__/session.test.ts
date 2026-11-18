import { describe, it, expect, beforeEach } from 'vitest';
import { resetServerEnvForTests } from '../env';
import { isAdminSession, verifyAccessToken } from '../session';
import { createToken } from './token-factory';

describe('verifyAccessToken', () => {
    beforeEach(() => {
        resetServerEnvForTests();
    });

    it('returns the session for a correctly signed token', async () => {
        const session = await verifyAccessToken(await createToken({ roles: ['USER'] }));

        expect(session).toMatchObject({ userId: 7, username: 'alice', roles: ['USER'] });
    });

    it('rejects a token signed with another secret', async () => {
        const forged = await createToken({ secret: 'another-secret-with-at-least-32-chars!!', roles: ['ADMIN'] });

        expect(await verifyAccessToken(forged)).toBeNull();
    });

    it('rejects a correctly signed token that is not an access token', async () => {
        expect(await verifyAccessToken(await createToken({ tokenUse: 'refresh' }))).toBeNull();
    });

    it('rejects an expired token', async () => {
        expect(await verifyAccessToken(await createToken({ expiresIn: '-1m' }))).toBeNull();
    });

    it('rejects an unsigned token that claims the admin role', async () => {
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
        const payload = Buffer.from(
            JSON.stringify({ sub: 'mallory', userId: 1, roles: ['ADMIN'], exp: Math.floor(Date.now() / 1000) + 600 })
        ).toString('base64url');

        expect(await verifyAccessToken(`${header}.${payload}.`)).toBeNull();
    });

    it('rejects tokens with missing claims, malformed input or no token', async () => {
        expect(await verifyAccessToken(await createToken({ omit: 'roles' }))).toBeNull();
        expect(await verifyAccessToken(await createToken({ omit: 'userId' }))).toBeNull();
        expect(await verifyAccessToken(await createToken({ omit: 'token_use' }))).toBeNull();
        expect(await verifyAccessToken('not.a.jwt')).toBeNull();
        expect(await verifyAccessToken(undefined)).toBeNull();
    });
});

describe('isAdminSession', () => {
    const base = { userId: 1, username: 'u', exp: 1 };

    it('is true only for the ADMIN role', () => {
        expect(isAdminSession({ ...base, roles: ['ADMIN'] })).toBe(true);
        expect(isAdminSession({ ...base, roles: ['USER'] })).toBe(false);
        expect(isAdminSession(null)).toBe(false);
    });
});
