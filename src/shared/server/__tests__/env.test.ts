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

    it('rejects an invalid API_URL', () => {
        expect(() => parseServerEnv({ NODE_ENV: 'development', API_URL: 'not a url', JWT_SECRET: SECRET })).toThrow(
            /API_URL/
        );
    });
});
