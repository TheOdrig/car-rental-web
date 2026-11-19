import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const jar = new Map<string, string>();

vi.mock('next/headers', () => ({
    cookies: vi.fn(async () => ({
        get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
        set: (name: string, value: string) => {
            jar.set(name, value);
        },
        delete: (name: string) => {
            jar.delete(name);
        },
    })),
}));

import { resetServerEnvForTests } from '@/shared/server/env';
import { resetRefreshCacheForTests } from '@/shared/server/upstream';
import { GET as listAlerts } from '../admin/alerts/route';
import { POST as acknowledge } from '../admin/alerts/[id]/acknowledge/route';
import { GET as rentalDetail } from '../admin/rentals/[id]/detail/route';
import { GET as listRentals } from '../admin/rentals/route';
import { GET as carRentals } from '../admin/cars/[id]/rentals/route';
import { GET as userRentals } from '../admin/users/[id]/rentals/route';
import { GET as lateReturns } from '../admin/late-returns/route';
import { GET as listCars } from '../cars/route';
import { buildRentalDetail } from '../admin/rentals/_lib/rental-detail';

const fetchMock = vi.fn();

function ctx(id: string) {
    return { params: Promise.resolve({ id }) };
}

const noParams = { params: Promise.resolve({}) };

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function upstreamUrls(): string[] {
    return fetchMock.mock.calls.map(([url]) => String(url));
}

describe('admin BFF routes', () => {
    beforeEach(() => {
        jar.clear();
        jar.set('access_token', 'a1');
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    it('lists alerts from the v1 alerts endpoint', async () => {
        fetchMock.mockResolvedValueOnce(json([{ id: 1, severity: 'HIGH', title: 'Late' }]));

        const response = await listAlerts(new NextRequest('http://localhost:3000/api/admin/alerts?type=LATE_RETURN'), noParams);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual([{ id: 1, severity: 'HIGH', title: 'Late' }]);
        expect(upstreamUrls()[0]).toBe('http://localhost:8082/api/v1/admin/alerts?type=LATE_RETURN');
        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer a1');
    });

    it('acknowledges an alert with a POST and no body', async () => {
        fetchMock.mockResolvedValueOnce(json({ id: 5, acknowledged: true }));

        const response = await acknowledge(
            new NextRequest('http://localhost:3000/api/admin/alerts/5/acknowledge', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
            }),
            ctx('5')
        );

        expect(response.status).toBe(200);
        expect(upstreamUrls()[0]).toBe('http://localhost:8082/api/v1/admin/alerts/5/acknowledge');
        expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    });

    it('rejects a malformed alert id before calling the upstream', async () => {
        const response = await acknowledge(
            new NextRequest('http://localhost:3000/api/admin/alerts/x/acknowledge', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
            }),
            ctx('x')
        );

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('requires a session for every admin route', async () => {
        jar.clear();
        fetchMock.mockResolvedValue(
            json({ status: 401, detail: 'Authentication is required', code: 'AUTHENTICATION_FAILED' }, 401)
        );

        const response = await listAlerts(new NextRequest('http://localhost:3000/api/admin/alerts'), noParams);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toMatchObject({ code: 'AUTHENTICATION_FAILED', detail: 'Authentication is required' });
    });

    it('lists all rentals for admins under the admin namespace and forwards the query', async () => {
        fetchMock.mockResolvedValueOnce(json({ content: [], page: 0, size: 5, totalElements: 0, totalPages: 0 }));

        const response = await listRentals(new NextRequest('http://localhost:3000/api/admin/rentals?page=0&size=5'), noParams);

        expect(response.status).toBe(200);
        expect(upstreamUrls()[0]).toBe('http://localhost:8082/api/v1/rentals/admin?page=0&size=5');
    });

    it('no longer exposes the admin rental list on the public /api/rentals path', async () => {
        const publicRentals = await import('../rentals/route');

        expect(publicRentals).not.toHaveProperty('GET');
        expect(publicRentals).toHaveProperty('POST');
    });

    it('maps the vehicle rental history status filter to the API vocabulary', async () => {
        fetchMock.mockResolvedValueOnce(json({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }));

        const response = await carRentals(
            new NextRequest('http://localhost:3000/api/admin/cars/9/rentals?page=1&size=10&status=COMPLETED'),
            ctx('9')
        );

        expect(response.status).toBe(200);
        expect(upstreamUrls()[0]).toBe('http://localhost:8082/api/v1/admin/cars/9/rentals?page=1&size=10&status=Returned');
    });

    it('maps the customer rental history status filter to the API vocabulary', async () => {
        fetchMock.mockResolvedValueOnce(json({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }));

        await userRentals(
            new NextRequest('http://localhost:3000/api/admin/users/4/rentals?status=ACTIVE'),
            ctx('4')
        );

        expect(upstreamUrls()[0]).toBe('http://localhost:8082/api/v1/admin/users/4/rentals?status=In+Use');
    });

    it('normalises late return status labels', async () => {
        fetchMock.mockResolvedValueOnce(
            json({ content: [{ rentalId: 1, status: 'Severely Late' }, { rentalId: 2, status: 'On Time' }], page: 0 })
        );

        const response = await lateReturns(new NextRequest('http://localhost:3000/api/admin/late-returns'), noParams);
        const body = await response.json();

        expect(body.content.map((item: { status: string }) => item.status)).toEqual(['SEVERELY_LATE', 'ON_TIME']);
    });

    it('passes the upstream PageResponse through unchanged', async () => {
        fetchMock.mockResolvedValueOnce(
            json({ content: [{ id: 1 }], page: 2, size: 5, totalElements: 11, totalPages: 3 })
        );

        const response = await listCars(new NextRequest('http://localhost:3000/api/cars?page=2&size=5'), noParams);

        expect(await response.json()).toEqual({
            content: [{ id: 1 }],
            page: 2,
            size: 5,
            totalElements: 11,
            totalPages: 3,
        });
    });

    describe('GET /api/admin/rentals/{id}/detail', () => {
        const rental = {
            id: 7,
            status: 'Confirmed',
            startDate: '2026-12-01',
            endDate: '2026-12-04',
            days: 3,
            dailyPrice: 100,
            totalPrice: 300,
            finalPrice: 270,
            totalSavings: 30,
            currency: 'EUR',
            createTime: '2026-11-18T10:00:00Z',
            updateTime: '2026-11-19T10:00:00Z',
            approvalNotes: 'ok',
            userSummary: { id: 3, username: 'ahmet', email: 'a@x.com' },
            carSummary: { id: 8, brand: 'Fiat', model: 'Egea', licensePlate: '34 ABC 123' },
        };

        it('composes the rental, customer, vehicle, payment, damages and late return', async () => {
            fetchMock.mockImplementation(async (url: URL) => {
                const path = url.pathname;
                if (path === '/api/v1/rentals/7') return json(rental);
                if (path === '/api/v1/admin/users/3') {
                    return json({
                        id: 3,
                        firstName: 'Ahmet',
                        lastName: 'Yilmaz',
                        email: 'a@x.com',
                        phone: '+905551234567',
                        verification: { emailVerified: true, phoneVerified: false },
                        statistics: {
                            totalRentals: 4,
                            spentByCurrency: [
                                { currency: 'TRY', rentalCount: 3, totalSpent: 800 },
                                { currency: 'USD', rentalCount: 1, totalSpent: 90 },
                            ],
                            totalDamageReports: 1,
                        },
                    });
                }
                if (path === '/api/v1/cars/8') {
                    return json({ id: 8, brand: 'Fiat', model: 'Egea', fuelType: 'DIESEL', transmissionType: 'MANUAL' });
                }
                if (path === '/api/v1/rentals/7/payment') return json({ amount: 270, status: 'AUTHORIZED' });
                if (path === '/api/v1/admin/damages/vehicle/8') {
                    return json({ content: [{ id: 1, rentalId: 7 }, { id: 2, rentalId: 99 }] });
                }
                if (path === '/api/v1/admin/late-returns') {
                    return json({ content: [{ rentalId: 7, penaltyAmount: 50, status: 'Late' }] });
                }
                return json({ status: 404, detail: 'x', code: 'ENDPOINT_NOT_FOUND' }, 404);
            });

            const response = await rentalDetail(new NextRequest('http://localhost:3000/api/admin/rentals/7/detail'), ctx('7'));
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toMatchObject({
                id: 7,
                status: 'CONFIRMED',
                duration: 3,
                pricing: { dailyRate: 100, subtotal: 300, discounts: 30, finalTotal: 270, currency: 'EUR' },
                customer: {
                    firstName: 'Ahmet',
                    emailVerified: true,
                    stats: {
                        totalRentals: 4,
                        damageCount: 1,
                        spentByCurrency: [
                            { currency: 'TRY', totalSpent: 800 },
                            { currency: 'USD', totalSpent: 90 },
                        ],
                    },
                },
                vehicle: { id: 8, fuelType: 'DIESEL' },
                payment: { status: 'AUTHORIZED', totalAmount: 270 },
                penaltyAmount: 50,
                lateReturnStatus: 'LATE',
            });
            expect(body.damages).toEqual([{ id: 1, rentalId: 7 }]);
            expect(body.timeline.map((event: { type: string }) => event.type)).toEqual(['created', 'approved']);
        });

        it('still answers when the optional upstream calls fail', async () => {
            fetchMock.mockImplementation(async (url: URL) =>
                url.pathname === '/api/v1/rentals/7'
                    ? json(rental)
                    : json({ status: 500, detail: 'boom', code: 'INTERNAL_SERVER_ERROR' }, 500)
            );

            const response = await rentalDetail(new NextRequest('http://localhost:3000/api/admin/rentals/7/detail'), ctx('7'));
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.customer).toMatchObject({ id: 3, firstName: 'ahmet', email: 'a@x.com' });
            expect(body.payment.status).toBe('NONE');
            expect(body.damages).toEqual([]);
        });

        it('passes a missing rental through as a problem response', async () => {
            fetchMock.mockResolvedValue(json({ status: 404, detail: 'Rental not found', code: 'RENTAL_NOT_FOUND' }, 404));

            const response = await rentalDetail(new NextRequest('http://localhost:3000/api/admin/rentals/7/detail'), ctx('7'));

            expect(response.status).toBe(404);
            expect((await response.json()).code).toBe('RENTAL_NOT_FOUND');
        });
    });

    it('builds a detail view with sensible defaults', () => {
        const detail = buildRentalDetail({ rental: { id: 1, status: 'Returned', returnNotes: 'clean' } });

        expect(detail.status).toBe('COMPLETED');
        expect(detail.timeline.map((event) => event.type)).toEqual(['created', 'returned']);
        expect(detail.timeline[1].description).toBe('clean');
        expect(detail.pricing.currency).toBe('USD');
    });
});
