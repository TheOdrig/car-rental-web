import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/error';
import { toBackendCar } from '../admin/cars/_lib/to-backend-car';

const base = { brand: 'fiat', model: 'Egea', year: 2022, licensePlate: '35 abc 123', dailyRate: 1500 };

describe('toBackendCar currency', () => {
    it('sends the currency chosen in the form', () => {
        expect(toBackendCar({ ...base, currencyType: 'TRY' }, undefined).currencyType).toBe('TRY');
        expect(toBackendCar({ ...base, currencyType: 'eur' }, undefined).currencyType).toBe('EUR');
    });

    it('falls back to the default currency when none is given', () => {
        expect(toBackendCar(base, undefined).currencyType).toBe('USD');
    });

    it('rejects an unsupported currency', () => {
        expect(() => toBackendCar({ ...base, currencyType: 'XXX' }, undefined)).toThrow(ApiError);
    });
});
