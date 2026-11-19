import { expect, test } from '@playwright/test';
import { ADMIN_PASSWORD, ADMIN_USERNAME, loginViaUi } from './support';

test.describe('admin BFF routes against the real API', () => {
    test('dashboard, alerts, users and rental detail answer through the BFF', async ({ page }) => {
        await loginViaUi(page, ADMIN_USERNAME, ADMIN_PASSWORD);
        await expect(page).toHaveURL(/\/$/);

        const summary = await page.request.get('/api/admin/dashboard');
        expect(summary.status()).toBe(200);

        const revenue = await page.request.get('/api/admin/dashboard/revenue');
        expect(revenue.status()).toBe(200);
        const revenueBody = await revenue.json();
        expect(Array.isArray(revenueBody.breakdownByCurrency)).toBe(true);
        expect(revenueBody.breakdown).toBeUndefined();
        for (const row of revenueBody.monthlyRevenue) {
            expect(typeof row.currency).toBe('string');
        }

        await page.goto('/admin/dashboard');
        await expect(page.getByText(/Revenue Trends/).first()).toBeVisible();

        const alerts = await page.request.get('/api/admin/alerts');
        expect(alerts.status()).toBe(200);
        expect(Array.isArray(await alerts.json())).toBe(true);

        const users = await page.request.get('/api/admin/users?page=0&size=5');
        expect(users.status()).toBe(200);
        const list = await users.json();
        expect(list).toMatchObject({ page: 0, size: 5 });
        expect(list.totalElements).toBeGreaterThan(0);

        const rentals = await page.request.get('/api/admin/rentals?page=0&size=5');
        expect(rentals.status()).toBe(200);
        const rentalPage = await rentals.json();
        if (rentalPage.content.length > 0) {
            const rentalId = rentalPage.content[0].id;
            const detail = await page.request.get(`/api/admin/rentals/${rentalId}/detail`);
            expect(detail.status()).toBe(200);
            expect(await detail.json()).toMatchObject({ id: rentalId });
        }

        const late = await page.request.get('/api/admin/late-returns?page=0&size=5');
        expect(late.status()).toBe(200);

        const problem = await page.request.get('/api/admin/users/999999999');
        expect(problem.status()).toBe(404);
        expect(await problem.json()).toMatchObject({ code: 'USER_NOT_FOUND', status: 404 });
    });
});
