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
import { getCar, getCarCalendar } from '@/entities/car/api/cached-fetchers';
import { GET as listCars } from '../cars/route';
import { GET as carDetail } from '../cars/[id]/route';
import { GET as filterOptions } from '../cars/filter-options/route';
import { GET as similar } from '../cars/[id]/similar/route';
import { GET as calendar } from '../cars/[id]/availability/calendar/route';
import { POST as availabilitySearch } from '../cars/search/route';
import { GET as pricingPreview } from '../pricing/preview/route';
import { GET as exchangeRates } from '../exchange-rates/route';

const fetchMock = vi.fn();

function get(path: string): NextRequest {
    return new NextRequest(`http://localhost:3000${path}`);
}

function authHeaders(): Array<string | undefined> {
    return fetchMock.mock.calls.map(([, init]) => (init.headers as Record<string, string>).Authorization);
}

function futureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

describe('public catalogue routes', () => {
    beforeEach(() => {
        jar.clear();
        jar.set('access_token', 'stale-access');
        jar.set('refresh_token', 'refresh');
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => new Response(JSON.stringify({ id: 1 }), { status: 200 }));
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    const idContext = { params: Promise.resolve({ id: '1' }) };
    const noContext = { params: Promise.resolve({}) };

    it('does not send the bearer token for the car list', async () => {
        await listCars(get('/api/cars?page=0&sortBy=price&sortDirection=asc'), noContext);

        expect(fetchMock.mock.calls[0][0].toString()).toContain('/api/v1/cars/search?page=0&sortBy=price&sortDirection=asc');
        expect(authHeaders()).toEqual([undefined]);
    });

    it('does not send the bearer token for car detail, calendar and similar cars', async () => {
        const response = await carDetail(get('/api/cars/1?include=calendar,similar'), idContext);

        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(authHeaders()).toEqual([undefined, undefined, undefined]);
    });

    it.each([
        ['filter options', () => filterOptions(get('/api/cars/filter-options'), noContext)],
        ['similar cars', () => similar(get('/api/cars/1/similar'), idContext)],
        ['availability calendar', () => calendar(get('/api/cars/1/availability/calendar'), idContext)],
        ['pricing preview', () => pricingPreview(get('/api/pricing/preview?carId=1'), noContext)],
        ['exchange rates', () => exchangeRates(get('/api/exchange-rates'), noContext)],
    ])('does not send the bearer token for %s', async (_name, call) => {
        await call();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(authHeaders()).toEqual([undefined]);
    });

    it('does not send the bearer token for the availability search', async () => {
        const request = new NextRequest('http://localhost:3000/api/cars/search', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ startDate: futureDate(2), endDate: futureDate(5) }),
        });

        const response = await availabilitySearch(request, noContext);

        expect(response.status).toBe(200);
        expect(authHeaders()).toEqual([undefined]);
    });

    it('does not send the bearer token for server-rendered car pages', async () => {
        await getCar(1);
        await getCarCalendar(1);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(authHeaders()).toEqual([undefined, undefined]);
    });

    it('never refreshes the session for public calls even when the API answers 401', async () => {
        fetchMock.mockImplementation(async () => new Response(JSON.stringify({ code: 'AUTHENTICATION_FAILED' }), { status: 401 }));

        const response = await listCars(get('/api/cars'), noContext);

        expect(response.status).toBe(401);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(jar.get('refresh_token')).toBe('refresh');
    });
});
