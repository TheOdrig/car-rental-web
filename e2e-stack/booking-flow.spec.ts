import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    carAvailableFor,
    collectCspViolations,
    isoDate,
    loginViaUi,
    registerViaUi,
    uniqueUser,
} from './support';

const JSON_HEADERS = { 'content-type': 'application/json' };

test.describe.serial('booking, admin confirmation and the pay page', () => {
    let customerContext: BrowserContext;
    let customerPage: Page;
    let cspViolations: string[];
    let adminContext: BrowserContext;
    let adminPage: Page;

    test.beforeAll(async ({ browser }) => {
        customerContext = await browser.newContext();
        customerPage = await customerContext.newPage();
        cspViolations = collectCspViolations(customerPage);
        await registerViaUi(customerPage, uniqueUser());

        adminContext = await browser.newContext();
        adminPage = await adminContext.newPage();
        await loginViaUi(adminPage, ADMIN_USERNAME, ADMIN_PASSWORD);
        await expect(adminPage).toHaveURL(/\/$/);
    });

    test.afterAll(async () => {
        await customerContext.close();
        await adminContext.close();
    });

    test('request a booking, confirm it as admin and open the pay page', async () => {
        const startDate = isoDate(2);
        const endDate = isoDate(4);
        const carId = await carAvailableFor(customerPage.request, startDate, endDate);

        const created = await customerPage.request.post('/api/rentals', {
            headers: JSON_HEADERS,
            data: { carId, startDate, endDate },
        });
        expect(created.status()).toBe(201);
        const rental = await created.json();
        expect(rental.status).toBe('Requested');

        await customerPage.goto('/rentals');
        await expect(customerPage.getByText(/requested/i).first()).toBeVisible();

        const early = await customerPage.request.post(`/api/rentals/${rental.id}/payment-intent`, {
            headers: JSON_HEADERS,
        });
        expect(early.ok()).toBe(false);

        await adminPage.goto(`/admin/rentals/${rental.id}`);
        await adminPage.getByRole('button', { name: 'Approve' }).click();

        await expect
            .poll(async () => (await (await customerPage.request.get(`/api/rentals/${rental.id}`)).json()).status)
            .toBe('Confirmed');

        await customerPage.goto(`/rentals/${rental.id}/pay`);
        await expect(
            customerPage.locator('[data-testid^="payment-state-"], form, iframe[name^="__privateStripeFrame"]').first()
        ).toBeVisible();
        await expect(customerPage.getByText('Rental not found')).toHaveCount(0);
        expect(cspViolations).toEqual([]);
    });

    test('a rental that starts after the payment window shows when payment opens', async () => {
        const startDate = isoDate(40);
        const endDate = isoDate(42);
        const carId = await carAvailableFor(customerPage.request, startDate, endDate);

        const created = await customerPage.request.post('/api/rentals', {
            headers: JSON_HEADERS,
            data: { carId, startDate, endDate },
        });
        expect(created.status()).toBe(201);
        const rental = await created.json();

        const approved = await adminPage.request.post(`/api/admin/rentals/${rental.id}/approve`, {
            headers: JSON_HEADERS,
            data: {},
        });
        expect(approved.ok()).toBe(true);

        await customerPage.goto(`/rentals/${rental.id}/pay`);
        await expect(customerPage.getByTestId('payment-state-window-not-open')).toBeVisible();
        await expect(customerPage.getByText(/Payment opens on /)).toBeVisible();
    });
});
