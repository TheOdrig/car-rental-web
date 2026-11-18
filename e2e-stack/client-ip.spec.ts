import { expect, test, type APIRequestContext } from '@playwright/test';

const LOGIN_CAPACITY = 10;

function loginAttempt(request: APIRequestContext, forwardedFor: string) {
    return request.post('/api/auth/login', {
        headers: { 'content-type': 'application/json', 'x-forwarded-for': forwardedFor },
        data: { username: `nobody_${Date.now().toString(36)}`, password: 'WrongPass1!' },
    });
}

function testNetAddress(): string {
    return `203.0.113.${1 + Math.floor(Math.random() * 250)}`;
}

test.describe('client IP forwarding reaches the API rate limiter', () => {
    test('each forwarded client address gets its own login bucket', async ({ request }) => {
        const first = testNetAddress();
        let second = testNetAddress();
        while (second === first) second = testNetAddress();

        for (let attempt = 1; attempt <= LOGIN_CAPACITY; attempt += 1) {
            const response = await loginAttempt(request, first);
            expect(response.status(), `attempt ${attempt} for ${first}`).toBe(401);
        }

        const exhausted = await loginAttempt(request, first);
        expect(exhausted.status()).toBe(429);
        expect(exhausted.headers()['retry-after']).toBeTruthy();
        expect((await exhausted.json()).code).toBe('RATE_LIMIT_EXCEEDED');

        const other = await loginAttempt(request, second);
        expect(other.status(), 'a different client address must not share the exhausted bucket').toBe(401);
    });

    test('a client supplied X-Client-IP never moves a request into another bucket', async ({ request }) => {
        const address = testNetAddress();
        for (let attempt = 1; attempt <= LOGIN_CAPACITY; attempt += 1) {
            await loginAttempt(request, address);
        }

        const spoofed = await request.post('/api/auth/login', {
            headers: {
                'content-type': 'application/json',
                'x-forwarded-for': address,
                'x-client-ip': '198.51.100.77',
            },
            data: { username: `nobody_${Date.now().toString(36)}`, password: 'WrongPass1!' },
        });

        expect(spoofed.status()).toBe(429);
    });
});
