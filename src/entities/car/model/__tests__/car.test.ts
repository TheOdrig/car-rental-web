import { describe, it, expect } from 'vitest';
import { Car, FuelType, TransmissionType } from '@/entities/car/model/types';
import { isAvailable, getCarTitle, getFormattedPrice } from '@/entities/car/lib/utils';
const mockCar: Car = {
    id: 1,
    licensePlate: 'ABC-123',
    brand: 'Tesla',
    model: 'Model 3',
    productionYear: 2023,
    color: 'White',
    price: 100,
    currencyType: 'USD',
    carStatusType: 'Available',
    imageUrl: 'tesla.jpg',
    fuelType: FuelType.ELECTRIC,
    transmissionType: TransmissionType.AUTOMATIC,
};
const maintenanceCar: Car = {
    ...mockCar,
    id: 2,
    carStatusType: 'Maintenance',
};
describe('Car Entity', () => {
    describe('Utils', () => {
        describe('isAvailable', () => {
            it('should return true for available car', () => {
                expect(isAvailable(mockCar)).toBe(true);
            });
            it('should return false for a car in maintenance', () => {
                expect(isAvailable(maintenanceCar)).toBe(false);
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
});