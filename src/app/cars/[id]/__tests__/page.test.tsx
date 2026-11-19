import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '@/shared/api';

const notFoundMock = vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({ notFound: () => notFoundMock() }));
vi.mock('@/entities/car', () => ({ SimilarCarsSection: () => null }));
vi.mock('@/widgets/car-booking-card', () => ({ CarBookingCard: () => null }));
vi.mock('../client-car-detail', () => ({ ClientCarDetail: () => null }));

const getCar = vi.fn();
const getCarCalendar = vi.fn();
vi.mock('@/entities/car/api/cached-fetchers', () => ({
    getCar: (...args: unknown[]) => getCar(...args),
    getCarCalendar: (...args: unknown[]) => getCarCalendar(...args),
}));

import CarDetailPage, { generateMetadata } from '../page';

function problem(status: number): ApiError {
    return new ApiError({ status, message: 'x', timestamp: new Date().toISOString() });
}

function props(id: string) {
    return { params: Promise.resolve({ id }) };
}

describe('car detail page', () => {
    beforeEach(() => {
        notFoundMock.mockClear();
        getCar.mockReset();
        getCarCalendar.mockReset();
        getCarCalendar.mockResolvedValue(undefined);
    });

    it.each(['abc', '12abc', '1.5', '-3', '0', '1e3', '99999999999999999999'])('answers not-found for the id %s without calling the API', async (id) => {
        await expect(CarDetailPage(props(id))).rejects.toThrow('NEXT_NOT_FOUND');

        expect(getCar).not.toHaveBeenCalled();
    });

    it('answers not-found only for an API 404', async () => {
        getCar.mockRejectedValue(problem(404));

        await expect(CarDetailPage(props('5'))).rejects.toThrow('NEXT_NOT_FOUND');
    });

    it.each([500, 503, 429])('rethrows an API %i so the error boundary handles it', async (status) => {
        const failure = problem(status);
        getCar.mockRejectedValue(failure);

        await expect(CarDetailPage(props('5'))).rejects.toBe(failure);
        expect(notFoundMock).not.toHaveBeenCalled();
    });

    it('rethrows network failures', async () => {
        const failure = new TypeError('fetch failed');
        getCar.mockRejectedValue(failure);

        await expect(CarDetailPage(props('5'))).rejects.toBe(failure);
        expect(notFoundMock).not.toHaveBeenCalled();
    });

    it('renders the page for an existing car', async () => {
        getCar.mockResolvedValue({ id: 5, brand: 'Audi', model: 'A3', productionYear: 2022 });

        const page = await CarDetailPage(props('5'));

        expect(page).toBeTruthy();
        expect(getCar).toHaveBeenCalledWith(5);
    });

    it('titles the metadata by outcome', async () => {
        getCar.mockRejectedValueOnce(problem(404));
        expect(await generateMetadata(props('5'))).toEqual({ title: 'Car Not Found' });

        getCar.mockRejectedValueOnce(problem(500));
        expect(await generateMetadata(props('5'))).toEqual({ title: 'Car' });

        expect(await generateMetadata(props('abc'))).toEqual({ title: 'Car Not Found' });
    });
});
