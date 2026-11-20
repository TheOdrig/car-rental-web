import { expect, test } from '@playwright/test';
import { signIn, stubApi, type Role } from './support/api-stub';

const SECRET = process.env.E2E_JWT_SECRET;
const MIN_TARGET = 44;
const MIN_TEXT_LINK_WIDTH = 24;

const VIEWPORTS = [
    { width: 360, height: 780 },
    { width: 390, height: 844 },
];

const PAGES: Array<{ path: string; role?: Role; ready: string }> = [
    { path: '/', ready: 'main' },
    { path: '/cars', ready: 'main' },
    { path: '/login', ready: 'main' },
    { path: '/register', ready: 'main' },
    { path: '/terms', ready: 'main' },
    { path: '/rentals', role: 'USER', ready: 'h1' },
    { path: '/rentals/2', role: 'USER', ready: 'main' },
    { path: '/settings/profile', role: 'USER', ready: 'main' },
    { path: '/settings/security', role: 'USER', ready: 'main' },
    { path: '/admin/dashboard', role: 'ADMIN', ready: 'h1' },
    { path: '/admin/fleet', role: 'ADMIN', ready: 'h1' },
    { path: '/admin/rentals', role: 'ADMIN', ready: 'h1' },
    { path: '/admin/alerts', role: 'ADMIN', ready: 'h1' },
];

interface SmallTarget {
    tag: string;
    label: string;
    width: number;
    height: number;
}

function findSmallTargets(args: { min: number; minTextLinkWidth: number }): SmallTarget[] {
    const selector = 'button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=checkbox], [role=switch], [role=combobox], [role=slider]';
    const small: SmallTarget[] = [];

    function visible(element: Element, rect: DOMRect): boolean {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (rect.width <= 1 && rect.height <= 1) return false;
        return rect.width > 0 && rect.height > 0;
    }

    function hitBox(element: Element, rect: DOMRect): { width: number; height: number } {
        const after = getComputedStyle(element, '::after');
        if (after.position !== 'absolute' || after.content === 'none') return { width: rect.width, height: rect.height };
        const left = Math.min(rect.left, rect.left + parseFloat(after.left || '0'));
        const top = Math.min(rect.top, rect.top + parseFloat(after.top || '0'));
        const right = Math.max(rect.right, rect.left + parseFloat(after.left || '0') + parseFloat(after.width || '0'));
        const bottom = Math.max(rect.bottom, rect.top + parseFloat(after.top || '0') + parseFloat(after.height || '0'));
        return { width: right - left, height: bottom - top };
    }

    for (const element of Array.from(document.querySelectorAll(selector))) {
        if (element.closest('nextjs-portal, [data-nextjs-dev-tools-button], .tsqd-parent-container, .tsqd-open-btn-container')) continue;
        if (element.matches('.tsqd-open-btn') || element.closest('[aria-hidden="true"]')) continue;
        const rect = element.getBoundingClientRect();
        if (!visible(element, rect)) continue;

        const isLink = element.tagName === 'A';
        if (isLink && element.closest('p, label')) continue;

        const box = hitBox(element, rect);
        const hasText = (element.textContent ?? '').trim().length > 0;
        const widthOk = isLink && hasText ? box.width >= args.minTextLinkWidth : box.width >= args.min;
        if (box.height >= args.min - 0.5 && widthOk) continue;

        small.push({
            tag: element.tagName.toLowerCase(),
            label: (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 40),
            width: Math.round(box.width),
            height: Math.round(box.height),
        });
    }
    return small;
}

for (const viewport of VIEWPORTS) {
    test.describe(`mobile layout at ${viewport.width}x${viewport.height}`, () => {
        test.use({ viewport, hasTouch: true });

        for (const entry of PAGES) {
            test(`${entry.path} has no horizontal overflow and 44px touch targets`, async ({ page }) => {
                test.skip(Boolean(entry.role) && !SECRET, 'set E2E_JWT_SECRET to the secret the server under test was started with');

                if (entry.role) await signIn(page, entry.role);
                await stubApi(page);

                await page.goto(entry.path);
                await expect(page.locator(entry.ready).first()).toBeVisible();
                await page.waitForLoadState('networkidle');

                const overflow = await page.evaluate(() => ({
                    scrollWidth: document.documentElement.scrollWidth,
                    innerWidth: window.innerWidth,
                }));
                expect(overflow.scrollWidth, `scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth}`).toBeLessThanOrEqual(overflow.innerWidth);

                const small = await page.evaluate(findSmallTargets, { min: MIN_TARGET, minTextLinkWidth: MIN_TEXT_LINK_WIDTH });
                expect(small.map((target) => `${target.tag} "${target.label}" ${target.width}x${target.height}`)).toEqual([]);
            });
        }
    });
}
