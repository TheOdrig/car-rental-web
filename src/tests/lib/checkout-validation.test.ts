import { describe, it, expect } from 'vitest';
import {
    personalDetailsSchema,
    paymentFormSchema,
    addonsSchema,
    checkoutFormSchema,
    createCVCSchema,
    validateCheckoutForm,
    CheckoutValidationMessages,
} from '@/lib/validations/checkout';
import { createMockCheckoutFormData } from '@/tests/factories';

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

    describe('paymentFormSchema', () => {
        it('should validate correct payment details', () => {
            const data = {
                cardNumber: '4111 1111 1111 1111',
                expiryDate: '12/29',
                cvc: '123',
                cardholderName: 'JOHN DOE',
            };

            const result = paymentFormSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should reject invalid card number', () => {
            const data = {
                cardNumber: '1234 5678 9012 3456',
                expiryDate: '12/25',
                cvc: '123',
                cardholderName: 'JOHN DOE',
            };

            const result = paymentFormSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject expired card', () => {
            const data = {
                cardNumber: '4111 1111 1111 1111',
                expiryDate: '01/20',
                cvc: '123',
                cardholderName: 'JOHN DOE',
            };

            const result = paymentFormSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject wrong expiry format', () => {
            const data = {
                cardNumber: '4111 1111 1111 1111',
                expiryDate: '12-25',
                cvc: '123',
                cardholderName: 'JOHN DOE',
            };

            const result = paymentFormSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject too short CVC', () => {
            const data = {
                cardNumber: '4111 1111 1111 1111',
                expiryDate: '12/29',
                cvc: '12',
                cardholderName: 'JOHN DOE',
            };

            const result = paymentFormSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject CVC with letters', () => {
            const data = {
                cardNumber: '4111 1111 1111 1111',
                expiryDate: '12/29',
                cvc: '12A',
                cardholderName: 'JOHN DOE',
            };

            const result = paymentFormSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject empty cardholder name', () => {
            const data = {
                cardNumber: '4111 1111 1111 1111',
                expiryDate: '12/29',
                cvc: '123',
                cardholderName: '',
            };

            const result = paymentFormSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('addonsSchema', () => {
        it('should validate empty addons array', () => {
            const result = addonsSchema.safeParse({ addons: [] });
            expect(result.success).toBe(true);
        });

        it('should validate addons with string IDs', () => {
            const result = addonsSchema.safeParse({ addons: ['cdw', 'gps'] });
            expect(result.success).toBe(true);
        });

        it('should reject missing addons field', () => {
            const result = addonsSchema.safeParse({});
            expect(result.success).toBe(false);
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

    describe('createCVCSchema', () => {
        it('should create schema for 3-digit CVC', () => {
            const schema = createCVCSchema('visa');
            expect(schema.safeParse('123').success).toBe(true);
            expect(schema.safeParse('1234').success).toBe(false);
        });

        it('should create schema for 4-digit CVC for Amex', () => {
            const schema = createCVCSchema('amex');
            expect(schema.safeParse('1234').success).toBe(true);
            expect(schema.safeParse('123').success).toBe(false);
        });
    });

    describe('validateCheckoutForm', () => {
        it('should validate form with dynamic CVC check for Visa', () => {
            const data = createMockCheckoutFormData({ cvc: '123' });
            const result = validateCheckoutForm(data, '4111111111111111');
            expect(result.success).toBe(true);
        });

        it('should validate form with dynamic CVC check for Amex', () => {
            const data = createMockCheckoutFormData({
                cardNumber: '341111111111111',
                cvc: '1234',
            });
            const result = validateCheckoutForm(data, '341111111111111');
            expect(result.success).toBe(true);
        });

        it('should reject wrong CVC length for Amex', () => {
            const data = createMockCheckoutFormData({
                cardNumber: '341111111111111',
                cvc: '123', 
            });
            const result = validateCheckoutForm(data, '341111111111111');
            expect(result.success).toBe(false);
        });
    });

    describe('CheckoutValidationMessages', () => {
        it('should have all required message keys', () => {
            expect(CheckoutValidationMessages.firstName).toBeDefined();
            expect(CheckoutValidationMessages.lastName).toBeDefined();
            expect(CheckoutValidationMessages.email).toBeDefined();
            expect(CheckoutValidationMessages.phone).toBeDefined();
            expect(CheckoutValidationMessages.cardNumber).toBeDefined();
            expect(CheckoutValidationMessages.expiryDate).toBeDefined();
            expect(CheckoutValidationMessages.cvc).toBeDefined();
            expect(CheckoutValidationMessages.cardholderName).toBeDefined();
        });

        it('should have required and invalid messages for each field', () => {
            expect(CheckoutValidationMessages.firstName.required).toBeDefined();
            expect(CheckoutValidationMessages.email.invalid).toBeDefined();
            expect(CheckoutValidationMessages.cardNumber.invalid).toBeDefined();
        });
    });
});

