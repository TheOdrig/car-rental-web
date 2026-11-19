import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api';
import { carFormFieldErrors, validateCarForm } from '../use-car-form';
import { defaultCarFormData } from '../../model/types';

const valid = {
    ...defaultCarFormData,
    brand: 'Toyota',
    model: 'Corolla',
    licensePlate: '34ABC34',
    fuelType: 'Gasoline',
    transmissionType: 'Automatic',
    dailyRate: 80,
};

describe('validateCarForm', () => {
    it('accepts a complete form without a VIN or image', () => {
        expect(validateCarForm(valid)).toEqual({});
    });

    it('rejects a VIN that is not 17 characters instead of dropping it silently', () => {
        expect(validateCarForm({ ...valid, vin: 'ABC123' }).vin).toMatch(/exactly 17 characters \(6 entered\)/);
        expect(validateCarForm({ ...valid, vin: '1HGBH41JXMN109186' }).vin).toBeUndefined();
    });

    it('rejects an image URL that is not http or https', () => {
        expect(validateCarForm({ ...valid, imageUrl: '/images/x.svg' }).imageUrl).toMatch(/http/);
        expect(validateCarForm({ ...valid, imageUrl: 'https://cdn.example.com/x.jpg' }).imageUrl).toBeUndefined();
    });
});

describe('carFormFieldErrors', () => {
    it('maps backend field names to form fields', () => {
        const error = new ApiError({
            status: 400,
            message: 'Validation failed',
            timestamp: new Date().toISOString(),
            errors: [
                { field: 'vinNumber', message: 'VIN must be 17 characters' },
                { field: 'price', message: 'Price must be positive' },
                { field: 'unknownField', message: 'ignored' },
            ],
        });

        expect(carFormFieldErrors(error)).toEqual({ vin: 'VIN must be 17 characters', dailyRate: 'Price must be positive' });
    });

    it('returns nothing for a plain error', () => {
        expect(carFormFieldErrors(new Error('boom'))).toEqual({});
    });
});
