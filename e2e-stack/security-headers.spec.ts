import { expect, test } from '@playwright/test';
import { collectCspViolations } from './support';

test.describe('security headers against the running app', () => {
    test('every page answers with the hardening headers', async ({ request }) => {
        const response = await request.get('/');
        const headers = response.headers();

        expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
        expect(headers['content-security-policy']).toContain('https://js.stripe.com');
        expect(headers['content-security-policy']).toContain('https://*.js.stripe.com');
        expect(headers['content-security-policy']).toContain('https://*.link.com');
        expect(headers['content-security-policy']).not.toContain('maps.googleapis.com');
        expect(headers['x-frame-options']).toBe('DENY');
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        expect(headers['permissions-policy']).toContain('camera=()');
    });

    test('the file proxy sandboxes its responses with its own CSP', async ({ request }) => {
        const response = await request.get('/api/files/avatars/00000000-0000-0000-0000-000000000000.png');

        expect(response.headers()['content-security-policy']).toBe("default-src 'none'; sandbox");
        expect(response.headers()['x-content-type-options']).toBe('nosniff');
    });

    test('public pages render without CSP violations', async ({ page }) => {
        const violations = collectCspViolations(page);

        for (const path of ['/', '/cars', '/login', '/register']) {
            await page.goto(path);
            await expect(page.locator('main, body').first()).toBeVisible();
        }

        expect(violations).toEqual([]);
    });
});
