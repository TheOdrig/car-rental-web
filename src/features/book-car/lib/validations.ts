import { z } from 'zod';

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

export const personalDetailsSchema = z.object(personalDetailsFields);
export const checkoutFormSchema = z.object(personalDetailsFields);

export type CheckoutFormSchema = z.infer<typeof checkoutFormSchema>;
export type PersonalDetailsSchema = z.infer<typeof personalDetailsSchema>;

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
} as const;
