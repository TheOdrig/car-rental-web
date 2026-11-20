import type { Page, Route } from '@playwright/test';
import { SignJWT } from 'jose';

const SECRET = process.env.E2E_JWT_SECRET;

export type Role = 'USER' | 'ADMIN';

export async function signIn(page: Page, role: Role): Promise<void> {
    const key = new TextEncoder().encode(SECRET);
    const token = await new SignJWT({ token_use: 'access', userId: role === 'ADMIN' ? 1 : 2, roles: [role] })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(role === 'ADMIN' ? 'admin' : 'qa')
        .setExpirationTime('1h')
        .sign(key);
    const origin = new URL(process.env.E2E_BASE_URL ?? 'http://localhost:3000');
    await page.context().addCookies([
        { name: 'access_token', value: token, domain: origin.hostname, path: '/', httpOnly: true },
        { name: 'refresh_token', value: 'stub-refresh', domain: origin.hostname, path: '/', httpOnly: true },
    ]);
}

function car(id: number, status = 'AVAILABLE') {
    return {
        id,
        brand: id % 2 ? 'Toyota' : 'Tesla',
        model: id % 2 ? 'Corolla' : 'Model 3',
        productionYear: 2022,
        price: 88.49,
        currencyType: 'USD',
        carStatusType: status,
        licensePlate: `QA-${id}00`,
        fuelType: 'Petrol',
        transmissionType: 'Automatic',
        bodyType: 'Sedan',
        seats: 5,
        color: 'White',
        imageUrl: '/images/car-placeholder.svg',
        thumbnailUrl: '/images/car-placeholder.svg',
    };
}

function rental(id: number, status: string) {
    return {
        id,
        status,
        startDate: '2030-03-01',
        endDate: '2030-03-04',
        days: 3,
        dailyPrice: 88.49,
        originalPrice: 265.48,
        totalPrice: 265.48,
        currency: 'USD',
        paymentOpensOn: '2030-02-24',
        carSummary: { id: 1, brand: 'Toyota', model: 'Corolla', licensePlate: 'QA-100', thumbnailUrl: '/images/car-placeholder.svg' },
        userSummary: { id: 2, username: 'qa', email: 'qa@example.com' },
        createTime: '2030-01-01T10:00:00Z',
        updateTime: '2030-01-02T10:00:00Z',
    };
}

const STATUSES = ['REQUESTED', 'CONFIRMED', 'IN_USE', 'RETURNED', 'CANCELLED'];

function pageOf<T>(content: T[]) {
    return { content, page: 0, number: 0, size: 12, totalElements: content.length, totalPages: 1 };
}

function pendingItem(id: number, status: string) {
    return {
        rentalId: id,
        customerId: 2,
        customerName: 'Qa Tester',
        customerEmail: 'qa@example.com',
        carId: 1,
        carBrand: 'Toyota',
        carModel: 'Corolla',
        licensePlate: 'QA-100',
        startDate: '2030-03-01',
        endDate: '2030-03-04',
        totalAmount: 265.48,
        currency: 'USD',
        status,
        createdAt: '2030-01-01T10:00:00Z',
    };
}

function answer(url: URL): unknown {
    const path = url.pathname;
    if (path === '/api/cars') return pageOf([car(1), car(2), car(3), car(4)]);
    if (path === '/api/cars/filter-options') {
        return { brands: ['Tesla', 'Toyota'], transmissionTypes: ['Automatic'], fuelTypes: ['Petrol'], bodyTypes: ['Sedan'] };
    }
    if (path === '/api/exchange-rates') {
        return {
            baseCurrency: 'USD',
            rates: { USD: 1, EUR: 0.9, GBP: 0.8, TRY: 42, JPY: 150 },
            timestamp: '2030-01-01T00:00:00Z',
            source: 'FALLBACK',
            rateCount: 5,
        };
    }
    if (path === '/api/rentals/me') return pageOf(STATUSES.map((status, index) => rental(index + 1, status)));
    if (path === '/api/rentals/2') return rental(2, 'CONFIRMED');
    if (path === '/api/admin/dashboard') {
        return {
            generatedAt: '2030-01-01T10:00:00Z',
            pendingApprovals: 2,
            todaysPickups: 1,
            todaysReturns: 1,
            overdueRentals: 0,
            pendingDamageAssessments: 0,
        };
    }
    if (path === '/api/admin/fleet') {
        return {
            generatedAt: '2030-01-01T10:00:00Z',
            availableCars: 4,
            rentedCars: 1,
            reservedCars: 0,
            maintenanceCars: 1,
            inspectionCars: 0,
            damagedCars: 0,
            occupancyRate: 20,
        };
    }
    if (path === '/api/admin/dashboard/revenue') {
        return { generatedAt: '2030-01-01T10:00:00Z', monthlyRevenue: [], breakdownByCurrency: [], dailyRevenue: [] };
    }
    if (path === '/api/admin/dashboard/pending/approvals') {
        return pageOf([pendingItem(11, 'REQUESTED'), pendingItem(12, 'REQUESTED')]);
    }
    if (path.startsWith('/api/admin/dashboard/pending/')) return pageOf([]);
    if (path === '/api/admin/cars') return pageOf([car(1), car(2, 'MAINTENANCE'), car(3, 'DAMAGED')]);
    if (path === '/api/users/me/profile') {
        return { id: 2, username: 'qa', email: 'qa@example.com', firstName: 'Qa', lastName: 'Tester', phone: '+15550100', emailVerified: false, role: 'USER' };
    }
    if (path === '/api/admin/alerts') {
        return [
            { id: 1, severity: 'WARNING', type: 'LATE_RETURN', title: 'Late return', message: 'Rental 12 is late', createdAt: '2030-01-01T10:00:00Z', actionUrl: '/admin/rentals/12', acknowledged: false },
            { id: 2, severity: 'CRITICAL', type: 'FAILED_PAYMENT', title: 'Payment failed', message: 'Rental 13 payment failed', createdAt: '2030-01-01T09:00:00Z', actionUrl: '/admin/rentals/13', acknowledged: false },
        ];
    }
    return undefined;
}

export async function stubApi(page: Page): Promise<void> {
    await page.route('**/api/**', async (route: Route) => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith('/api/auth/') || url.pathname === '/api/health') {
            await route.continue();
            return;
        }
        const body = answer(url);
        if (body === undefined) {
            await route.fulfill({
                status: 404,
                contentType: 'application/problem+json',
                body: JSON.stringify({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Stubbed as missing', code: 'NOT_FOUND' }),
            });
            return;
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
}
