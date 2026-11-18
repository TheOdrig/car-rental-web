import { expect, test, type Locator } from '@playwright/test';
import { firstAvailableCarId } from './support';

async function shownPrices(cards: Locator): Promise<number[]> {
    const texts = await cards.allInnerTexts();
    return texts.map((text) => Number(text.trim().split('$').pop()));
}

test.describe('catalog against the real API', () => {
    test('browse the cars list and sort by price', async ({ page }) => {
        await page.goto('/cars');

        const cards = page.locator('a[href^="/cars/"]');
        await expect(cards.first()).toBeVisible();

        const sorted = page.waitForResponse(
            (response) =>
                response.url().includes('/api/cars?') &&
                response.url().includes('sortBy=price') &&
                response.url().includes('sortDirection=asc') &&
                response.ok()
        );
        await page.getByRole('combobox').first().click();
        await page.getByRole('option', { name: 'Price: Low to High' }).click();
        const body = await (await sorted).json();

        expect(body).toMatchObject({ page: 0 });
        expect(body.totalElements).toBeGreaterThan(0);
        expect(body.content.length).toBeGreaterThan(1);

        test.info().annotations.push({
            type: 'api-contract',
            description:
                'GET /api/v1/cars/search accepts sortBy and sortDirection but does not apply them; the web sorts each page client-side',
        });

        await expect.poll(async () => (await shownPrices(cards)).length).toBeGreaterThan(1);
        const shown = await shownPrices(cards);
        expect(shown).toEqual([...shown].sort((left, right) => left - right));
    });

    test('car detail shows the car and its availability calendar', async ({ page, request }) => {
        const carId = await firstAvailableCarId(request);

        await page.goto(`/cars/${carId}`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        const calendar = await request.get(`/api/cars/${carId}/availability/calendar`);
        expect(calendar.ok()).toBe(true);
        const days = (await calendar.json()).days;
        expect(Array.isArray(days)).toBe(true);
        expect(days.length).toBeGreaterThan(0);
        expect(days[0]).toMatchObject({ status: expect.stringMatching(/Available|Unavailable/) });
    });
});
