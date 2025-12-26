import { z } from 'zod';
import {
    validateCardNumber,
    validateExpiryDate,
    detectCardType,
} from '@/lib/utils/checkout-utils';

const personalDetailsFields = {
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters')
        .refine(
            (val) => /^[a-zA-Z\s'-]+$/.test(val),
            'First name can only contain letters'
        ),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters')
        .refine(
            (val) => /^[a-zA-Z\s'-]+$/.test(val),
            'Last name can only contain letters'
        ),
    email: z.email('Please enter a valid email address'),
    phone: z
        .string()
        .min(7, 'Phone number is too short')
        .max(20, 'Phone number is too long')
        .refine(
            (val) => /^\+?[\d\s()-]+$/.test(val),
            'Please enter a valid phone number'
        ),
};

const paymentFormFields = {
    cardNumber: z
        .string()
        .min(13, 'Card number is too short')
        .refine(
            (val) => validateCardNumber(val),
            'Please enter a valid card number'
        ),
    expiryDate: z
        .string()
        .refine((val) => /^\d{2}\/\d{2}$/.test(val), 'Please use MM/YY format')
        .refine((val) => validateExpiryDate(val), 'Card has expired'),
    cvc: z
        .string()
        .min(3, 'CVC must be at least 3 digits')
        .max(4, 'CVC must be at most 4 digits')
        .refine((val) => /^\d+$/.test(val), 'CVC must contain only numbers'),
    cardholderName: z
        .string()
        .min(2, 'Cardholder name must be at least 2 characters')
        .max(100, 'Cardholder name is too long')
        .refine(
            (val) => /^[a-zA-Z\s'-]+$/.test(val),
            'Cardholder name can only contain letters'
        ),
};

const addonsFields = {
    addons: z.array(z.string()).default([]),
};

export const personalDetailsSchema = z.object(personalDetailsFields);
export const paymentFormSchema = z.object(paymentFormFields);
export const addonsSchema = z.object(addonsFields);

export const checkoutFormSchema = z.object({
    ...personalDetailsFields,
    ...paymentFormFields,
    ...addonsFields,
});

export type CheckoutFormSchema = z.infer<typeof checkoutFormSchema>;
export type PersonalDetailsSchema = z.infer<typeof personalDetailsSchema>;
export type PaymentFormSchema = z.infer<typeof paymentFormSchema>;
export type AddonsSchema = z.infer<typeof addonsSchema>;

export const CheckoutValidationMessages = {
    firstName: {
        required: 'First name is required',
        min: 'First name must be at least 2 characters',
        invalid: 'First name can only contain letters',
    },
    lastName: {
        required: 'Last name is required',
        min: 'Last name must be at least 2 characters',
        invalid: 'Last name can only contain letters',
    },
    email: {
        required: 'Email is required',
        invalid: 'Please enter a valid email address',
    },
    phone: {
        required: 'Phone number is required',
        invalid: 'Please enter a valid phone number',
    },
    cardNumber: {
        required: 'Card number is required',
        invalid: 'Please enter a valid card number',
    },
    expiryDate: {
        required: 'Expiry date is required',
        format: 'Please use MM/YY format',
        expired: 'Card has expired',
    },
    cvc: {
        required: 'CVC is required',
        invalid: 'Invalid CVC',
    },
    cardholderName: {
        required: 'Cardholder name is required',
        invalid: 'Please enter a valid name',
    },
} as const;

export function createCVCSchema(cardType: string) {
    const expectedLength = cardType === 'amex' ? 4 : 3;
    return z
        .string()
        .length(expectedLength, `CVC must be ${expectedLength} digits`)
        .refine((val) => /^\d+$/.test(val), 'CVC must contain only numbers');
}

export function validateCheckoutForm(data: unknown, cardNumber?: string) {
    const cardType = cardNumber ? detectCardType(cardNumber) : 'unknown';

    const dynamicSchema = z.object({
        ...personalDetailsFields,
        ...paymentFormFields,
        ...addonsFields,
        cvc: createCVCSchema(cardType),
    });

    return dynamicSchema.safeParse(data);
}
