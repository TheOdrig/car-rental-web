import { z } from 'zod';

export const carIdSchema = z.coerce
    .number({ message: 'Car ID must be a number' })
    .int({ message: 'Car ID must be an integer' })
    .positive({ message: 'Car ID must be a positive number' });

export const rentalIdSchema = z.coerce
    .number({ message: 'Rental ID must be a number' })
    .int({ message: 'Rental ID must be an integer' })
    .positive({ message: 'Rental ID must be a positive number' });

export const userIdSchema = z.coerce
    .number({ message: 'User ID must be a number' })
    .int({ message: 'User ID must be an integer' })
    .positive({ message: 'User ID must be a positive number' });

export const positiveIntSchema = z.coerce
    .number({ message: 'ID must be a number' })
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive number' });

export interface ValidationResult<T> {
    success: true;
    data: T;
}

export interface ValidationError {
    success: false;
    error: string;
}

export type ValidateResult<T> = ValidationResult<T> | ValidationError;

export function validateParams<T>(
    schema: z.ZodType<T>,
    value: unknown
): ValidateResult<T> {
    const result = schema.safeParse(value);

    if (!result.success) {
        const firstError = result.error.issues[0];
        return {
            success: false,
            error: firstError?.message ?? 'Invalid parameter',
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

export function validateParamsObject<T extends Record<string, z.ZodType>>(
    schemas: T,
    values: Record<keyof T, unknown>
): ValidateResult<{ [K in keyof T]: z.infer<T[K]> }> {
    const result: Record<string, unknown> = {};

    for (const [key, schema] of Object.entries(schemas)) {
        const validation = validateParams(schema, values[key]);
        if (!validation.success) {
            return validation;
        }
        result[key] = validation.data;
    }

    return {
        success: true,
        data: result as { [K in keyof T]: z.infer<T[K]> },
    };
}
