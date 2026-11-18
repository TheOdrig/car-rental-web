import { expect, test } from '@playwright/test';
import { loginViaUi, registerViaUi, uniqueUser } from './support';

test.describe('authentication against the real API', () => {
    test('register, log out and log in again', async ({ page }) => {
        const user = uniqueUser();

        await registerViaUi(page, user);
        const session = await page.request.get('/api/auth/me');
        expect(session.status()).toBe(200);
        expect((await session.json()).username).toBe(user.username);

        const cookies = await page.context().cookies();
        const access = cookies.find((cookie) => cookie.name === 'access_token');
        expect(access?.httpOnly).toBe(true);

        await page.request.post('/api/auth/logout', { headers: { 'content-type': 'application/json' }, data: {} });
        expect((await page.request.get('/api/auth/me')).status()).toBe(401);

        await loginViaUi(page, user.username, user.password);
        await expect(page).toHaveURL(/\/$/);
        expect((await page.request.get('/api/auth/me')).status()).toBe(200);
    });

    test('a wrong password shows an error and no session', async ({ page }) => {
        await loginViaUi(page, 'nobody_here', 'WrongPass1!');

        await expect(page).toHaveURL(/\/login/);
        expect((await page.request.get('/api/auth/me')).status()).toBe(401);
    });
});
