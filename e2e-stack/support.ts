import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? 'admin';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin123!';
export const CUSTOMER_PASSWORD = 'E2eStackPass1!';

export function uniqueUser() {
    const suffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;
    return {
        username: `e2e_${suffix}`,
        email: `e2e_${suffix}@example.com`,
        password: CUSTOMER_PASSWORD,
        firstName: 'Stack',
        lastName: 'Tester',
    };
}

export function isoDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().slice(0, 10);
}

export async function registerViaUi(page: Page, user: ReturnType<typeof uniqueUser>) {
    await page.goto('/register');
    await page.locator('#firstName').fill(user.firstName);
    await page.locator('#lastName').fill(user.lastName);
    await page.locator('#username').fill(user.username);
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.locator('#confirmPassword').fill(user.password);
    await page.locator('#terms').click();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/$/);
}

export async function loginViaUi(page: Page, username: string, password: string, callbackUrl?: string) {
    await page.goto(callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login');
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();
}

export async function firstAvailableCarId(request: APIRequestContext): Promise<number> {
    const response = await request.get('/api/cars?carStatusType=AVAILABLE&page=0&size=12');
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(Array.isArray(body.content)).toBe(true);
    const car = body.content.find((entry: { carStatusType?: string }) => entry.carStatusType === 'AVAILABLE');
    expect(car, 'the dev seed should contain an available car').toBeTruthy();
    return car.id as number;
}

export async function carAvailableFor(request: APIRequestContext, startDate: string, endDate: string): Promise<number> {
    const response = await request.post('/api/cars/search', {
        headers: { 'content-type': 'application/json' },
        data: { startDate, endDate, page: 0, size: 12 },
    });
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.cars.length, 'a car should be free for the requested dates').toBeGreaterThan(0);
    return body.cars[0].id as number;
}

export function collectCspViolations(page: Page): string[] {
    const violations: string[] = [];
    page.on('console', (message) => {
        const text = message.text();
        if (message.type() === 'error' && /content security policy/i.test(text)) {
            violations.push(text);
        }
    });
    return violations;
}
