import { describe, it, expect, beforeEach } from 'vitest';
import { useCarStore } from '@/entities/car/model/store';
import { Car, CarStatus, FuelType, TransmissionType } from '@/entities/car/model/types';
import { isAvailable, getCarTitle, getFormattedPrice } from '@/entities/car/lib/utils';
import { act } from 'react';

const mockCar: Car = {
    id: 1,
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    color: 'White',
    dailyPrice: 100,
    status: CarStatus.AVAILABLE,
    imageUrl: 'tesla.jpg',
    fuelType: FuelType.ELECTRIC,
    transmission: TransmissionType.AUTOMATIC,
};

const rentedCar: Car = {
    ...mockCar,
    id: 2,
    status: CarStatus.RENTED,
};

describe('Car Entity', () => {
    describe('Utils', () => {
        describe('isAvailable', () => {
            it('should return true for available car', () => {
                expect(isAvailable(mockCar)).toBe(true);
            });

            it('should return false for rented car', () => {
                expect(isAvailable(rentedCar)).toBe(false);
            });
        });

        describe('getCarTitle', () => {
            it('should format title correctly', () => {
                expect(getCarTitle(mockCar)).toBe('Tesla Model 3 (2023)');
            });
        });

        describe('getFormattedPrice', () => {
            it('should format price correctly', () => {
                expect(getFormattedPrice(mockCar)).toBe('$100.00');
            });
        });
    });

    describe('Store', () => {
        beforeEach(() => {
            act(() => {
                useCarStore.setState({ cars: [], selectedCar: null });
            })
        });

        it('should set cars list', () => {
            const { setCars } = useCarStore.getState();

            act(() => {
                setCars([mockCar, rentedCar]);
            })

            const state = useCarStore.getState();
            expect(state.cars).toHaveLength(2);
            expect(state.cars[0]).toEqual(mockCar);
        });

        it('should select a car', () => {
            const { selectCar } = useCarStore.getState();

            act(() => {
                selectCar(mockCar);
            })

            const state = useCarStore.getState();
            expect(state.selectedCar).toEqual(mockCar);
        });

        it('should update car status', () => {
            const { setCars, updateCarStatus, selectCar } = useCarStore.getState();

            act(() => {
                setCars([mockCar]);
                selectCar(mockCar);
                updateCarStatus(1, CarStatus.MAINTENANCE);
            })

            const state = useCarStore.getState();

            expect(state.cars[0].status).toBe(CarStatus.MAINTENANCE);

            expect(state.selectedCar?.status).toBe(CarStatus.MAINTENANCE);
        });

        it('should not update selected car if ids do not match', () => {
            const { setCars, updateCarStatus, selectCar } = useCarStore.getState();

            act(() => {
                setCars([mockCar, rentedCar]);
                selectCar(rentedCar);
                updateCarStatus(1, CarStatus.MAINTENANCE);
            })

            const state = useCarStore.getState();
            expect(state.cars.find(c => c.id === 1)?.status).toBe(CarStatus.MAINTENANCE);
            expect(state.selectedCar?.id).toBe(2);
            expect(state.selectedCar?.status).toBe(CarStatus.RENTED);
        });
    });
});
