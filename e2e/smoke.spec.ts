import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
    test('health endpoint reports ok', async ({ request }) => {
        const response = await request.get('/api/health');

        expect(response.ok()).toBe(true);
        expect(await response.json()).toEqual({ status: 'ok' });
    });

    test('home page renders the hero search', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('heading', { level: 1, name: 'Find Your Perfect Ride' })).toBeVisible();
    });

    test('car catalog loads', async ({ page }) => {
        await page.goto('/cars');

        await expect(page).toHaveURL(/\/cars/);
        await expect(page.locator('main')).toBeVisible();
    });

    test('login page is reachable for anonymous visitors', async ({ page }) => {
        await page.goto('/login');

        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    });

    test('anonymous visitors are redirected from admin pages to login', async ({ page }) => {
        await page.goto('/admin/dashboard');

        await expect(page).toHaveURL(/\/login\?callbackUrl=/);
    });

    test('admin api rejects anonymous requests', async ({ request }) => {
        const response = await request.get('/api/admin/users');

        expect(response.status()).toBe(401);
    });
});
