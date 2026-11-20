import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { signIn, stubApi, type Role } from './support/api-stub';

const SECRET = process.env.E2E_JWT_SECRET;
const RULES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function describe(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']): string[] {
    return violations.flatMap((violation) =>
        violation.nodes.slice(0, 12).map((node) => {
            const data = node.any[0]?.data as { fgColor?: string; bgColor?: string; contrastRatio?: number } | undefined;
            const contrast = data?.contrastRatio ? ` ${data.fgColor} on ${data.bgColor} = ${data.contrastRatio}` : '';
            return `${violation.id}${contrast} :: ${node.html.slice(0, 110)}`;
        })
    );
}

const PAGES: Array<{ path: string; role?: Role; ready: string }> = [
    { path: '/', ready: 'main' },
    { path: '/cars', ready: 'main' },
    { path: '/rentals', role: 'USER', ready: 'h1' },
    { path: '/rentals/2', role: 'USER', ready: 'main' },
    { path: '/admin/dashboard', role: 'ADMIN', ready: 'h1' },
    { path: '/admin/fleet', role: 'ADMIN', ready: 'h1' },
    { path: '/admin/rentals', role: 'ADMIN', ready: 'h1' },
    { path: '/admin/alerts', role: 'ADMIN', ready: 'h1' },
    { path: '/settings/profile', role: 'USER', ready: 'main' },
    { path: '/settings/security', role: 'USER', ready: 'main' },
];

test.describe('accessibility of data pages against a stubbed API', () => {
    test.skip(!SECRET, 'set E2E_JWT_SECRET to the secret the server under test was started with');

    for (const scheme of ['light', 'dark'] as const) {
        for (const entry of PAGES) {
            test(`${entry.path} has no axe violations (${scheme})`, async ({ page }) => {
                await page.emulateMedia({ colorScheme: scheme });
                await page.addInitScript((value) => localStorage.setItem('theme', value), scheme);
                if (entry.role) await signIn(page, entry.role);
                await stubApi(page);

                await page.goto(entry.path);
                await expect(page.locator(entry.ready).first()).toBeVisible();
                await page.waitForLoadState('networkidle');

                const results = await new AxeBuilder({ page }).withTags(RULES).analyze();

                expect(describe(results.violations)).toEqual([]);
            });
        }
    }

    test('the admin dashboard pending table keeps Status and Action in view at 1440px', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await signIn(page, 'ADMIN');
        await stubApi(page);

        await page.goto('/admin/dashboard');
        const action = page.getByRole('button', { name: /Approve rental request for Qa Tester/ }).first();
        await expect(action).toBeVisible();

        const box = await action.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
    });

    test('the pending table actions are reachable without sideways scrolling at 320px', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await signIn(page, 'ADMIN');
        await stubApi(page);

        await page.goto('/admin/dashboard');
        const action = page.getByRole('button', { name: /Approve rental request for Qa Tester/ }).first();
        await action.scrollIntoViewIfNeeded();
        const box = await action.boundingBox();

        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    });

    test('admin pages use their own shell without the public header or footer', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await signIn(page, 'ADMIN');
        await stubApi(page);

        await page.goto('/admin/dashboard');
        await expect(page.locator('h1').first()).toBeVisible();

        await expect(page.getByRole('link', { name: 'Browse Cars' })).toHaveCount(0);
        await expect(page.getByRole('contentinfo')).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'View site' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();
    });

    test('admin pages have exactly one menu button on a phone', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await signIn(page, 'ADMIN');
        await stubApi(page);

        await page.goto('/admin/dashboard');
        await expect(page.locator('h1').first()).toBeVisible();

        await expect(page.getByRole('button', { name: 'Open admin menu' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveCount(0);
    });

    test('the public header brand stays on one line at 320px', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await stubApi(page);

        await page.goto('/terms');
        await page.waitForLoadState('networkidle');
        const brand = page.locator('header a[href="/"]').first();
        const box = await brand.boundingBox();

        expect(box).not.toBeNull();
        expect(box!.height).toBeLessThan(56);
        const currency = await page.getByRole('button', { name: /^Currency:/ }).boundingBox();
        expect(currency).not.toBeNull();
        expect(box!.x + box!.width).toBeLessThanOrEqual(currency!.x);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
    });
});
