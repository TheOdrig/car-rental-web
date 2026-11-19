import { describe, it, expect } from 'vitest';
import { RentalStatus } from '../../model/types';
import { getActionButtons } from '../utils';
import { getPayByLabel, getRentalPaymentStateLabel, isRentalPaymentSecured } from '../rental-payment-state';
import { getCancelledByLabel } from '../rental-cancellation';

describe('rental payment state', () => {
    it('treats authorized and captured payments as secured', () => {
        expect(isRentalPaymentSecured('AUTHORIZED')).toBe(true);
        expect(isRentalPaymentSecured('CAPTURED')).toBe(true);
        for (const status of ['PENDING', 'FAILED', 'REFUNDED', 'CANCELLED', undefined, null]) {
            expect(isRentalPaymentSecured(status)).toBe(false);
        }
    });

    it('names the secured states honestly', () => {
        expect(getRentalPaymentStateLabel('CAPTURED')).toBe('Paid');
        expect(getRentalPaymentStateLabel('AUTHORIZED')).toBe('Payment authorized');
        expect(getRentalPaymentStateLabel('PENDING')).toBeUndefined();
    });

    it('formats the pay-by instant in local time and ignores a missing or invalid one', () => {
        expect(getPayByLabel('2030-05-06T12:00:00Z')).toMatch(/^Pay by May [5-7], 2030/);
        expect(getPayByLabel(undefined)).toBeUndefined();
        expect(getPayByLabel('not a date')).toBeUndefined();
    });

    it('drops Pay Now once the payment is authorized or captured', () => {
        for (const paymentStatus of ['AUTHORIZED', 'CAPTURED']) {
            const buttons = getActionButtons(RentalStatus.CONFIRMED, { paymentStatus });
            expect(buttons.map((button) => button.action)).toEqual(['view']);
        }
        expect(getActionButtons(RentalStatus.CONFIRMED, { paymentStatus: 'PENDING' }).map((b) => b.action)).toEqual([
            'view',
            'pay',
        ]);
    });
});

describe('getCancelledByLabel', () => {
    it('words each canceller for the audience', () => {
        expect(getCancelledByLabel('CUSTOMER', 'customer')).toBe('Cancelled by you');
        expect(getCancelledByLabel('CUSTOMER', 'admin')).toBe('Cancelled by the customer');
        expect(getCancelledByLabel('ADMIN', 'customer')).toBe('Cancelled by our team');
        expect(getCancelledByLabel('ADMIN', 'admin')).toBe('Cancelled by an admin');
        expect(getCancelledByLabel('SYSTEM', 'customer')).toBe('Cancelled automatically (payment not completed)');
        expect(getCancelledByLabel('SYSTEM', 'admin')).toBe('Cancelled automatically (payment not completed)');
    });

    it('falls back to a plain label for an unknown canceller', () => {
        expect(getCancelledByLabel(undefined)).toBe('Cancelled');
        expect(getCancelledByLabel('ROBOT')).toBe('Cancelled');
    });
});
