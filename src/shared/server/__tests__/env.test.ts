import { describe, it, expect } from 'vitest';
import { parseServerEnv } from '../env';

const SECRET = 'a'.repeat(32);

describe('parseServerEnv', () => {
    it('defaults API_URL outside production', () => {
        const env = parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET });
        expect(env.API_URL).toBe('http://localhost:8082');
    });

    it('requires API_URL in production', () => {
        expect(() => parseServerEnv({ NODE_ENV: 'production', JWT_SECRET: SECRET })).toThrow(/API_URL/);
    });

    it('strips trailing slashes from API_URL', () => {
        const env = parseServerEnv({ NODE_ENV: 'production', API_URL: 'http://api:8082//', JWT_SECRET: SECRET });
        expect(env.API_URL).toBe('http://api:8082');
    });

    it('rejects a missing or short JWT_SECRET', () => {
        expect(() => parseServerEnv({ NODE_ENV: 'development' })).toThrow(/JWT_SECRET/);
        expect(() => parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
    });

    it('defaults API_TIMEOUT_MS to 5000 and accepts an override', () => {
        expect(parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET }).API_TIMEOUT_MS).toBe(5000);
        expect(
            parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET, API_TIMEOUT_MS: '1500' }).API_TIMEOUT_MS
        ).toBe(1500);
    });

    it('rejects a non-positive API_TIMEOUT_MS', () => {
        expect(() => parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET, API_TIMEOUT_MS: '0' })).toThrow(
            /API_TIMEOUT_MS/
        );
        expect(() => parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET, API_TIMEOUT_MS: 'abc' })).toThrow(
            /API_TIMEOUT_MS/
        );
    });

    it('rejects an invalid API_URL', () => {
        expect(() => parseServerEnv({ NODE_ENV: 'development', API_URL: 'not a url', JWT_SECRET: SECRET })).toThrow(
            /API_URL/
        );
    });
});

describe('parseServerEnv client IP settings', () => {
    it('defaults TRUSTED_PROXY_HOPS to 0 and parses an override', () => {
        expect(parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET }).TRUSTED_PROXY_HOPS).toBe(0);
        expect(
            parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET, TRUSTED_PROXY_HOPS: '2' }).TRUSTED_PROXY_HOPS
        ).toBe(2);
    });

    it('rejects a negative or non-numeric TRUSTED_PROXY_HOPS', () => {
        expect(() => parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET, TRUSTED_PROXY_HOPS: '-1' })).toThrow(
            /TRUSTED_PROXY_HOPS/
        );
        expect(() => parseServerEnv({ NODE_ENV: 'development', JWT_SECRET: SECRET, TRUSTED_PROXY_HOPS: 'x' })).toThrow(
            /TRUSTED_PROXY_HOPS/
        );
    });
});
