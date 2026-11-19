import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/login', '/register', '/forgot-password', '/terms', '/privacy'];
const RULES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('accessibility', () => {
    for (const path of PAGES) {
        test(`${path} has no axe violations`, async ({ page }) => {
            await page.goto(path);
            await expect(page.locator('main')).toBeVisible();

            const results = await new AxeBuilder({ page }).withTags(RULES).analyze();

            expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`)).toEqual([]);
        });
    }

    test('each page exposes exactly one h1', async ({ page }) => {
        for (const path of PAGES) {
            await page.goto(path);
            await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        }
    });

    test('an unknown car answers with a real 404', async ({ request }) => {
        const response = await request.get('/cars/999999999');

        expect(response.status()).toBe(404);
    });
});
