import { loadStripe, type Stripe } from '@stripe/stripe-js';

const TEST_KEY_PATTERN = /^pk_test_/;

const cache = new Map<string, Promise<Stripe | null>>();

export function isTestPublishableKey(key: string | null | undefined): key is string {
    return typeof key === 'string' && TEST_KEY_PATTERN.test(key);
}

export function resolvePublishableKey(
    fromApi: string | null | undefined,
    fallback: string | null | undefined
): string | null {
    const candidate = fromApi ?? fallback ?? null;
    return isTestPublishableKey(candidate) ? candidate : null;
}

export function getStripe(publishableKey: string): Promise<Stripe | null> {
    let promise = cache.get(publishableKey);
    if (!promise) {
        promise = loadStripe(publishableKey);
        cache.set(publishableKey, promise);
    }
    return promise;
}
