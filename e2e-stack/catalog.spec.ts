import { expect, test, type Locator } from '@playwright/test';
import { firstAvailableCarId } from './support';

async function shownPrices(cards: Locator): Promise<number[]> {
    const texts = await cards.allInnerTexts();
    return texts.map((text) => Number(text.trim().split('$').pop()));
}

test.describe('catalog against the real API', () => {
    test('browse the cars list and sort by price', async ({ page, request }) => {
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

        const prices = (content: { price: number }[]) => content.map((car) => car.price);
        expect(prices(body.content)).toEqual([...prices(body.content)].sort((left, right) => left - right));

        await expect.poll(async () => (await shownPrices(cards)).length).toBeGreaterThan(1);
        expect(await shownPrices(cards)).toEqual(prices(body.content));

        const all = await request.get('/api/cars?carStatusType=AVAILABLE&sortBy=price&sortDirection=asc&page=0&size=100');
        expect(all.ok()).toBe(true);
        const everything = prices((await all.json()).content);
        expect(everything).toEqual([...everything].sort((left, right) => left - right));

        const first = await (await request.get('/api/cars?sortBy=price&sortDirection=asc&page=0&size=2')).json();
        const second = await (await request.get('/api/cars?sortBy=price&sortDirection=asc&page=1&size=2')).json();
        expect(first.content.length).toBe(2);
        expect(second.content.length).toBeGreaterThan(0);
        expect(second.content[0].price).toBeGreaterThanOrEqual(first.content[1].price);

        const descending = await (await request.get('/api/cars?sortBy=price&sortDirection=desc&page=0&size=100')).json();
        expect(prices(descending.content)).toEqual([...prices(descending.content)].sort((left, right) => right - left));
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
        expect(days[0]).toMatchObject({ status: expect.stringMatching(/^(AVAILABLE|UNAVAILABLE)$/) });
    });
});
