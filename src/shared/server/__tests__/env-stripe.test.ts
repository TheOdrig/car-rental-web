import { describe, it, expect } from 'vitest';
import { parseServerEnv } from '../env';

const base = { NODE_ENV: 'development', JWT_SECRET: 'a'.repeat(32) };

describe('parseServerEnv STRIPE_PUBLISHABLE_KEY', () => {
    it('is optional', () => {
        expect(parseServerEnv(base).STRIPE_PUBLISHABLE_KEY).toBeUndefined();
        expect(parseServerEnv({ ...base, STRIPE_PUBLISHABLE_KEY: '' }).STRIPE_PUBLISHABLE_KEY).toBeUndefined();
    });

    it('accepts a test-mode key', () => {
        expect(parseServerEnv({ ...base, STRIPE_PUBLISHABLE_KEY: 'pk_test_51abcDEF' }).STRIPE_PUBLISHABLE_KEY).toBe(
            'pk_test_51abcDEF'
        );
    });

    it('rejects a live-mode key', () => {
        expect(() => parseServerEnv({ ...base, STRIPE_PUBLISHABLE_KEY: 'pk_live_51abcDEF' })).toThrow(/pk_test_/);
    });

    it('rejects a live-mode key in production too', () => {
        expect(() =>
            parseServerEnv({
                ...base,
                NODE_ENV: 'production',
                API_URL: 'http://api:8082',
                STRIPE_PUBLISHABLE_KEY: 'pk_live_51abcDEF',
            })
        ).toThrow(/STRIPE_PUBLISHABLE_KEY/);
    });

    it('rejects a secret key or arbitrary text', () => {
        expect(() => parseServerEnv({ ...base, STRIPE_PUBLISHABLE_KEY: 'sk_test_51abcDEF' })).toThrow(
            /STRIPE_PUBLISHABLE_KEY/
        );
        expect(() => parseServerEnv({ ...base, STRIPE_PUBLISHABLE_KEY: 'nonsense' })).toThrow(/STRIPE_PUBLISHABLE_KEY/);
    });
});
