import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    carAvailableFor,
    isoDate,
    loginViaUi,
    registerViaUi,
    uniqueUser,
} from './support';

const JSON_HEADERS = { 'content-type': 'application/json' };

test.describe.serial('damage charge through the BFF and the admin UI', () => {
    let customerContext: BrowserContext;
    let customerPage: Page;
    let adminContext: BrowserContext;
    let adminPage: Page;
    let damageId: number;

    test.beforeAll(async ({ browser }) => {
        customerContext = await browser.newContext();
        customerPage = await customerContext.newPage();
        await registerViaUi(customerPage, uniqueUser());

        adminContext = await browser.newContext();
        adminPage = await adminContext.newPage();
        await loginViaUi(adminPage, ADMIN_USERNAME, ADMIN_PASSWORD);
        await expect(adminPage).toHaveURL(/\/admin\/dashboard$/);
    });

    test.afterAll(async () => {
        await customerContext.close();
        await adminContext.close();
    });

    test('an assessed report is charged from the admin detail page and cannot be charged twice', async () => {
        const startDate = isoDate(0);
        const endDate = isoDate(2);
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

        const intent = await customerPage.request.post(`/api/rentals/${rental.id}/payment-intent`, {
            headers: JSON_HEADERS,
        });
        expect(intent.ok()).toBe(true);

        const pickup = await adminPage.request.post(`/api/admin/rentals/${rental.id}/pickup`, {
            headers: JSON_HEADERS,
            data: {},
        });
        expect(pickup.ok(), await pickup.text()).toBe(true);

        const reported = await adminPage.request.post(`/api/admin/damages?rentalId=${rental.id}`, {
            headers: JSON_HEADERS,
            data: { description: 'Scratch on the rear bumper', category: 'SCRATCH', initialSeverity: 'MINOR' },
        });
        expect(reported.status()).toBe(201);
        damageId = (await reported.json()).id;

        const assessed = await adminPage.request.post(`/api/admin/damages/${damageId}/assess`, {
            headers: JSON_HEADERS,
            data: {
                severity: 'MINOR',
                category: 'SCRATCH',
                repairCostEstimate: 150,
                currency: 'USD',
                insuranceCoverage: false,
            },
        });
        expect(assessed.ok(), await assessed.text()).toBe(true);
        const detail = await (await adminPage.request.get(`/api/admin/damages/${damageId}`)).json();
        expect(detail.status).toBe('ASSESSED');
        expect(detail.customerLiability).toBeGreaterThan(0);

        await adminPage.goto(`/admin/damages/${damageId}`);
        await adminPage.getByRole('button', { name: 'Charge customer' }).click();
        const dialog = adminPage.getByRole('alertdialog');
        await expect(dialog).toContainText('(USD)');
        await dialog.getByRole('button', { name: /^Charge/ }).click();

        await expect(adminPage.getByRole('button', { name: 'Charge customer' })).toHaveCount(0);
        await expect
            .poll(async () => (await (await adminPage.request.get(`/api/admin/damages/${damageId}`)).json()).status)
            .toBe('CHARGED');

        const again = await adminPage.request.post(`/api/admin/damages/${damageId}/charge`, { headers: JSON_HEADERS });
        expect(again.status()).toBe(400);
    });
});
