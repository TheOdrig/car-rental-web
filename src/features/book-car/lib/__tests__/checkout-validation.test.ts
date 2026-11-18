import { describe, it, expect } from 'vitest';
import {
    personalDetailsSchema,
    checkoutFormSchema,
    CheckoutValidationMessages,
} from '@/features/book-car';
import { createMockCheckoutFormData } from '@/features/book-car/testing/factories';

describe('checkout validation schemas', () => {
    describe('personalDetailsSchema', () => {
        it('should validate correct personal details', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1 555 123 4567',
            };
            const result = personalDetailsSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
        it('should reject empty first name', () => {
            const data = {
                firstName: '',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '5551234567',
            };
            const result = personalDetailsSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
        it('should reject first name shorter than 2 characters', () => {
            const data = {
                firstName: 'J',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '5551234567',
            };
            const result = personalDetailsSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
        it('should reject first name with numbers', () => {
            const data = {
                firstName: 'John123',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '5551234567',
            };
            const result = personalDetailsSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
        it('should reject invalid email format', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'not-an-email',
                phone: '5551234567',
            };
            const result = personalDetailsSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
        it('should reject short phone numbers', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '12345',
            };
            const result = personalDetailsSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
        it('should accept hyphenated names', () => {
            const data = {
                firstName: 'Mary-Jane',
                lastName: "O'Connor",
                email: 'mary@example.com',
                phone: '5551234567',
            };
            const result = personalDetailsSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });
    describe('checkoutFormSchema', () => {
        it('should validate complete checkout form', () => {
            const data = createMockCheckoutFormData();
            const result = checkoutFormSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
        it('should reject incomplete form', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
            };
            const result = checkoutFormSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
    describe('CheckoutValidationMessages', () => {
        it('should have all required message keys', () => {
            expect(CheckoutValidationMessages.firstName).toBeDefined();
            expect(CheckoutValidationMessages.lastName).toBeDefined();
            expect(CheckoutValidationMessages.email).toBeDefined();
            expect(CheckoutValidationMessages.phone).toBeDefined();
        });
        it('should not collect card details', () => {
            expect(Object.keys(CheckoutValidationMessages)).toEqual(['firstName', 'lastName', 'email', 'phone']);
            expect(Object.keys(checkoutFormSchema.shape)).toEqual(['firstName', 'lastName', 'email', 'phone']);
        });
        it('should have required and invalid messages for each field', () => {
            expect(CheckoutValidationMessages.firstName.required).toBeDefined();
            expect(CheckoutValidationMessages.email.invalid).toBeDefined();
        });
    });
});