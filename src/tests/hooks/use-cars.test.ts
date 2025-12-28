import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '../test-utils';
import { createMockCar, createMockCars, resetMockFactories } from '../factories';
import {
    carKeys,
    useCars,
    useCar,
    useCarCalendar,
    useSimilarCars,
    useCarSearch,
    useCarSearchResults,
    usePrefetchCar,
    useInvalidateCars,
} from '@/lib/hooks/use-cars';
import type { Car, PageResponse, CarAvailabilityCalendar, SimilarCar, AvailabilitySearchResponse } from '@/types';

vi.mock('@/lib/api/client', () => ({
    clientGet: vi.fn(),
    clientPost: vi.fn(),
}));

import { clientGet, clientPost } from '@/lib/api/client';

const mockClientGet = vi.mocked(clientGet);
const mockClientPost = vi.mocked(clientPost);

function createMockPageResponse<T>(content: T[], page = 0, totalPages = 1): PageResponse<T> {
    return {
        content,
        pageable: {
            pageNumber: page,
            pageSize: 10,
            offset: page * 10,
            paged: true,
            unpaged: false,
        },
        totalPages,
        totalElements: content.length,
        size: 10,
        number: page,
        first: page === 0,
        last: page === totalPages - 1,
        empty: content.length === 0,
    };
}

function createMockCalendar(): CarAvailabilityCalendar {
    return {
        carId: 1,
        carName: 'Toyota Corolla',
        month: {
            year: 2025,
            monthValue: 1,
            month: 'JANUARY',
        },
        days: [
            { date: '2025-01-01', status: 'Available' },
            { date: '2025-01-02', status: 'Unavailable', rentalId: 10 },
            { date: '2025-01-03', status: 'Available' },
        ],
        carBlocked: false,
    };
}

function createMockSimilarCars(): SimilarCar[] {
    return [
        { id: 2, brand: 'Honda', model: 'Civic', productionYear: 2023, imageUrl: '/honda.jpg', dailyRate: 45, totalPrice: 180, currency: 'USD' },
        { id: 3, brand: 'Mazda', model: '3', productionYear: 2022, imageUrl: '/mazda.jpg', dailyRate: 48, totalPrice: 192, currency: 'USD' },
    ];
}

describe('use-cars hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetMockFactories();
    });

    describe('carKeys', () => {
        it('should generate correct query keys', () => {
            expect(carKeys.all).toEqual(['cars']);
            expect(carKeys.lists()).toEqual(['cars', 'list']);
            expect(carKeys.list({ brand: 'Toyota' })).toEqual(['cars', 'list', { brand: 'Toyota' }]);
            expect(carKeys.details()).toEqual(['cars', 'detail']);
            expect(carKeys.detail(1)).toEqual(['cars', 'detail', 1]);
            expect(carKeys.search()).toEqual(['cars', 'search']);
            expect(carKeys.searchResult({ startDate: '2025-01-01', endDate: '2025-01-05' }))
                .toEqual(['cars', 'search', { startDate: '2025-01-01', endDate: '2025-01-05' }]);
            expect(carKeys.calendar(1, '2025-01')).toEqual(['cars', 'detail', 1, 'calendar', '2025-01']);
            expect(carKeys.similar(1)).toEqual(['cars', 'detail', 1, 'similar']);
        });
    });

    describe('useCars', () => {
        it('should fetch cars successfully', async () => {
            const mockCars = createMockCars(3);
            const mockResponse = createMockPageResponse(mockCars);
            mockClientGet.mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => useCars(), {
                wrapper: createQueryWrapper(),
            });

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockResponse);
            expect(result.current.data?.content).toHaveLength(3);
            expect(mockClientGet).toHaveBeenCalledWith('/api/cars?page=0&size=12&sort=createTime%2Cdesc');
        });

        it('should fetch cars with filters', async () => {
            const mockCars = createMockCars(2, { brand: 'Toyota' });
            const mockResponse = createMockPageResponse(mockCars);
            mockClientGet.mockResolvedValueOnce(mockResponse);

            const filters = { brand: 'Toyota', minPrice: 40 };
            const { result } = renderHook(() => useCars(filters), {
                wrapper: createQueryWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockClientGet).toHaveBeenCalledWith('/api/cars?brand=Toyota&minPrice=40&page=0&size=12&sort=createTime%2Cdesc');
        });

        it('should handle empty filters', async () => {
            const mockResponse = createMockPageResponse<Car>([]);
            mockClientGet.mockResolvedValueOnce(mockResponse);

            const { result } = renderHook(() => useCars({}), {
                wrapper: createQueryWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockClientGet).toHaveBeenCalledWith('/api/cars?page=0&size=12&sort=createTime%2Cdesc');
        });

        it('should handle fetch error', async () => {
            mockClientGet.mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => useCars(), {
                wrapper: createQueryWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeDefined();
        });
    });

    describe('useCar', () => {
        it('should fetch single car successfully', async () => {
            const mockCar = createMockCar({ id: 1 });
            mockClientGet.mockResolvedValueOnce({ car: mockCar });

            const { result } = renderHook(() => useCar(1), {
                wrapper: createQueryWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.car).toEqual(mockCar);
            expect(mockClientGet).toHaveBeenCalledWith('/api/cars/1');
        });

        it('should not fetch when id is null', async () => {
            const { result } = renderHook(() => useCar(null), {
                wrapper: createQueryWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(mockClientGet).not.toHaveBeenCalled();
        });

        it('should not fetch when id is undefined', async () => {
            const { result } = renderHook(() => useCar(undefined), {
                wrapper: createQueryWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(mockClientGet).not.toHaveBeenCalled();
        });

        it('should fetch car with calendar and similar options', async () => {
            const mockCar = createMockCar({ id: 1 });
            const mockCalendar = createMockCalendar();
            const mockSimilarCars = createMockSimilarCars();

            mockClientGet.mockResolvedValueOnce({
                car: mockCar,
                calendar: mockCalendar,
                similarCars: mockSimilarCars,
            });

            const { result } = renderHook(
                () => useCar(1, { includeCalendar: true, includeSimilar: true, calendarMonth: '2025-01' }),
                { wrapper: createQueryWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockClientGet).toHaveBeenCalledWith('/api/cars/1?include=calendar%2Csimilar&month=2025-01');
            expect(result.current.data?.calendar).toEqual(mockCalendar);
            expect(result.current.data?.similarCars).toEqual(mockSimilarCars);
        });
    });

    describe('useCarCalendar', () => {
        it('should fetch car calendar', async () => {
            const mockCalendar = createMockCalendar();
            mockClientGet.mockResolvedValueOnce({ calendar: mockCalendar });

            const { result } = renderHook(() => useCarCalendar(1, '2025-01'), {
                wrapper: createQueryWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockCalendar);
            expect(mockClientGet).toHaveBeenCalledWith('/api/cars/1?include=calendar&month=2025-01');
        });

        it('should not fetch when id is null', async () => {
            const { result } = renderHook(() => useCarCalendar(null), {
                wrapper: createQueryWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(mockClientGet).not.toHaveBeenCalled();
        });
    });

    describe('useSimilarCars', () => {
        it('should fetch similar cars', async () => {
            const mockSimilarCars = createMockSimilarCars();
            mockClientGet.mockResolvedValueOnce({ similarCars: mockSimilarCars });

            const { result } = renderHook(() => useSimilarCars(1), {
                wrapper: createQueryWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockSimilarCars);
            expect(mockClientGet).toHaveBeenCalledWith('/api/cars/1?include=similar');
        });

        it('should return empty array when no similar cars', async () => {
            mockClientGet.mockResolvedValueOnce({ similarCars: undefined });

            const { result } = renderHook(() => useSimilarCars(1), {
                wrapper: createQueryWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([]);
        });
    });

    describe('useCarSearch', () => {
        it('should search cars successfully', async () => {
            const mockSearchResponse: AvailabilitySearchResponse = {
                cars: [
                    {
                        id: 1,
                        brand: 'Toyota',
                        model: 'Corolla',
                        productionYear: 2023,
                        dailyRate: 50,
                        totalPrice: 200,
                        currency: 'USD',
                        imageUrl: '/toyota.jpg',
                        fuelType: 'GASOLINE',
                        transmissionType: 'AUTOMATIC',
                        seats: 5,
                    },
                ],
                totalElements: 1,
                totalPages: 1,
                currentPage: 0,
                pageSize: 10,
                searchStartDate: '2025-01-01',
                searchEndDate: '2025-01-05',
                rentalDays: 4,
            };
            mockClientPost.mockResolvedValueOnce(mockSearchResponse);

            const { result } = renderHook(() => useCarSearch(), {
                wrapper: createQueryWrapper(),
            });

            await result.current.mutateAsync({
                startDate: '2025-01-01',
                endDate: '2025-01-05',
            });

            expect(mockClientPost).toHaveBeenCalledWith('/api/cars/search', {
                startDate: '2025-01-01',
                endDate: '2025-01-05',
            });
        });

        it('should handle search error', async () => {
            mockClientPost.mockRejectedValueOnce(new Error('Search failed'));

            const { result } = renderHook(() => useCarSearch(), {
                wrapper: createQueryWrapper(),
            });

            await expect(
                result.current.mutateAsync({ startDate: '2025-01-01', endDate: '2025-01-05' })
            ).rejects.toThrow('Search failed');
        });
    });

    describe('useCarSearchResults', () => {
        it('should fetch search results with valid params', async () => {
            const mockSearchResponse: AvailabilitySearchResponse = {
                cars: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: 10,
                searchStartDate: '2025-01-01',
                searchEndDate: '2025-01-05',
                rentalDays: 4,
            };
            mockClientPost.mockResolvedValueOnce(mockSearchResponse);

            const { result } = renderHook(
                () => useCarSearchResults({ startDate: '2025-01-01', endDate: '2025-01-05' }),
                { wrapper: createQueryWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockClientPost).toHaveBeenCalledWith('/api/cars/search', {
                startDate: '2025-01-01',
                endDate: '2025-01-05',
            });
        });

        it('should not fetch when params is null', async () => {
            const { result } = renderHook(() => useCarSearchResults(null), {
                wrapper: createQueryWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(mockClientPost).not.toHaveBeenCalled();
        });

        it('should not fetch when startDate is missing', async () => {
            const { result } = renderHook(
                () => useCarSearchResults({ startDate: '', endDate: '2025-01-05' }),
                { wrapper: createQueryWrapper() }
            );

            expect(result.current.fetchStatus).toBe('idle');
            expect(mockClientPost).not.toHaveBeenCalled();
        });
    });

    describe('usePrefetchCar', () => {
        it('should return prefetch function', async () => {
            mockClientGet.mockResolvedValueOnce({ car: createMockCar({ id: 1 }) });

            const { result } = renderHook(() => usePrefetchCar(), {
                wrapper: createQueryWrapper(),
            });

            result.current(1);

            await waitFor(() => {
                expect(mockClientGet).toHaveBeenCalledWith('/api/cars/1');
            });
        });
    });

    describe('useInvalidateCars', () => {
        it('should return invalidation functions', () => {
            const { result } = renderHook(() => useInvalidateCars(), {
                wrapper: createQueryWrapper(),
            });

            expect(result.current.all).toBeDefined();
            expect(result.current.lists).toBeDefined();
            expect(result.current.single).toBeDefined();
            expect(result.current.search).toBeDefined();
            expect(typeof result.current.all).toBe('function');
            expect(typeof result.current.lists).toBe('function');
            expect(typeof result.current.single).toBe('function');
            expect(typeof result.current.search).toBe('function');
        });

        it('should invalidate queries when called', async () => {
            const mockCars = createMockCars(2);
            const mockResponse = createMockPageResponse(mockCars);
            mockClientGet.mockResolvedValue(mockResponse);

            const wrapper = createQueryWrapper();

            const { result: carsResult } = renderHook(() => useCars(), { wrapper });

            await waitFor(() => {
                expect(carsResult.current.isSuccess).toBe(true);
            });

            const { result: invalidateResult } = renderHook(() => useInvalidateCars(), { wrapper });

            await invalidateResult.current.lists();

            expect(mockClientGet).toHaveBeenCalledTimes(2);
        });
    });
});
