import { z } from 'zod';
import type { Schemas } from '@/shared/api/contract';

export const PAYMENT_STATUSES = ['PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'CANCELLED'] as const;

export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);

export type RentalPaymentStatus = z.infer<typeof paymentStatusSchema>;

const testPublishableKey = z.string().regex(/^pk_test_/, 'Only Stripe test-mode publishable keys are accepted');

export const paymentIntentSchema = z.object({
    paymentId: z.number(),
    rentalId: z.number(),
    paymentIntentId: z.string().min(1),
    clientSecret: z.string().min(1),
    publishableKey: testPublishableKey.nullable().optional(),
    status: paymentStatusSchema,
    amount: z.number(),
    currency: z.string().min(1),
});

export const rentalPaymentSchema = z.object({
    paymentId: z.number(),
    rentalId: z.number(),
    status: paymentStatusSchema,
    amount: z.number(),
    currency: z.string().min(1),
    refundedAmount: z.number().nullable().optional(),
    failureReason: z.string().nullable().optional(),
});

export type PaymentIntent = z.infer<typeof paymentIntentSchema>;
export type RentalPayment = z.infer<typeof rentalPaymentSchema>;

type IntentMatchesContract = keyof PaymentIntent extends keyof Schemas['PaymentIntentResult'] ? true : never;
type PaymentMatchesContract = keyof RentalPayment extends keyof Schemas['PaymentSummary'] ? true : never;

export const paymentSchemasMatchContract: [IntentMatchesContract, PaymentMatchesContract] = [true, true];

export const PAYMENT_POLL_CAP_MS = 30_000;
export const PAYMENT_POLL_INITIAL_MS = 1_000;
export const PAYMENT_POLL_MAX_MS = 4_000;

const POLL_STOP_STATUSES: readonly RentalPaymentStatus[] = ['AUTHORIZED', 'CAPTURED', 'FAILED'];
const PAYABLE_STATUSES: readonly RentalPaymentStatus[] = ['PENDING', 'FAILED', 'CANCELLED'];
const SUCCESS_STATUSES: readonly RentalPaymentStatus[] = ['AUTHORIZED', 'CAPTURED'];

export function isNeverChargedPayment(payment: Pick<RentalPayment, 'status' | 'refundedAmount'>): boolean {
    return payment.status === 'CANCELLED' && (payment.refundedAmount ?? 0) === 0;
}

export function isPollingDone(status: RentalPaymentStatus): boolean {
    return POLL_STOP_STATUSES.includes(status);
}

export function isPayableStatus(status: RentalPaymentStatus | undefined): boolean {
    return status === undefined || PAYABLE_STATUSES.includes(status);
}

export function isPaymentCancelled(status: RentalPaymentStatus | undefined): boolean {
    return status === 'CANCELLED';
}

export function isPaymentSecured(status: RentalPaymentStatus | undefined): boolean {
    return status !== undefined && SUCCESS_STATUSES.includes(status);
}

export function nextPollDelay(attempt: number): number {
    return Math.min(PAYMENT_POLL_INITIAL_MS * 2 ** Math.max(attempt, 0), PAYMENT_POLL_MAX_MS);
}

export const PAYMENT_STATUS_LABELS: Record<RentalPaymentStatus, string> = {
    PENDING: 'Awaiting payment',
    AUTHORIZED: 'Authorized',
    CAPTURED: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
    CANCELLED: 'Cancelled',
};
