import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/error';
import { carCreateRequest, carUpdateRequest, toBackendCar } from '../admin/cars/_lib/to-backend-car';

const base = { brand: 'fiat', model: 'Egea', year: 2022, licensePlate: '35 abc 123', dailyRate: 1500 };

describe('toBackendCar currency', () => {
    it('sends the currency chosen in the form', () => {
        expect(toBackendCar({ ...base, currencyType: 'TRY' }).currencyType).toBe('TRY');
        expect(toBackendCar({ ...base, currencyType: 'eur' }).currencyType).toBe('EUR');
    });

    it('falls back to the default currency when none is given', () => {
        expect(toBackendCar(base).currencyType).toBe('USD');
    });

    it('rejects an unsupported currency', () => {
        expect(() => toBackendCar({ ...base, currencyType: 'XXX' })).toThrow(ApiError);
    });
});

describe('toBackendCar image and VIN', () => {
    it('never sends a local placeholder path when no image URL is given', () => {
        expect(toBackendCar(base)).not.toHaveProperty('imageUrl');
        expect(toBackendCar({ ...base, imageUrl: '   ' })).not.toHaveProperty('imageUrl');
    });

    it('sends a valid http image URL and rejects anything else as a field error', () => {
        expect(toBackendCar({ ...base, imageUrl: 'https://cdn.example.com/car.jpg' }).imageUrl).toBe('https://cdn.example.com/car.jpg');

        try {
            toBackendCar({ ...base, imageUrl: '/images/car-placeholder.svg' });
            expect.unreachable();
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).errors).toEqual([
                { field: 'imageUrl', message: 'Image URL must start with http:// or https://' },
            ]);
        }
    });

    it('sends a 17 character VIN upper-cased and without separators', () => {
        expect(toBackendCar({ ...base, vin: '1hgbh41jxmn109186' }).vinNumber).toBe('1HGBH41JXMN109186');
    });

    it('rejects a VIN shorter than 17 characters instead of silently dropping it', () => {
        try {
            toBackendCar({ ...base, vin: 'ABC123' });
            expect.unreachable();
        } catch (error) {
            expect((error as ApiError).errors?.[0]).toEqual({ field: 'vinNumber', message: 'VIN must be exactly 17 characters' });
        }
    });

    it('leaves the VIN out when it is blank', () => {
        expect(toBackendCar({ ...base, vin: '' })).not.toHaveProperty('vinNumber');
    });
});

describe('car create and update requests', () => {
    it('creates a car as available', () => {
        expect(carCreateRequest(base).carStatusType).toBe('Available');
    });

    it('keeps status, kilometer, rating and VIN of the current car when editing', () => {
        const current = {
            id: 4,
            brand: 'Fiat',
            model: 'Egea',
            licensePlate: '35ABC123',
            productionYear: 2022,
            price: 1000,
            currencyType: 'TRY',
            carStatusType: 'Maintenance',
            kilometer: 42000,
            rating: 3.5,
            vinNumber: '1HGBH41JXMN109186',
            imageUrl: 'https://cdn.example.com/egea.jpg',
            fuelType: 'Diesel',
            createTime: 'ignored',
        };

        const request = carUpdateRequest(current, { ...base, dailyRate: 1200, currencyType: 'TRY' });

        expect(request).toMatchObject({
            carStatusType: 'Maintenance',
            kilometer: 42000,
            rating: 3.5,
            vinNumber: '1HGBH41JXMN109186',
            imageUrl: 'https://cdn.example.com/egea.jpg',
            price: 1200,
        });
        expect(request).not.toHaveProperty('id');
        expect(request).not.toHaveProperty('createTime');
    });

    it('lets the form override the stored image and VIN', () => {
        const request = carUpdateRequest(
            { carStatusType: 'Available', imageUrl: 'https://a.example/x.jpg', vinNumber: '1HGBH41JXMN109186' },
            { ...base, imageUrl: 'https://b.example/y.jpg', vin: '2HGBH41JXMN109187' }
        );

        expect(request.imageUrl).toBe('https://b.example/y.jpg');
        expect(request.vinNumber).toBe('2HGBH41JXMN109187');
    });
});
