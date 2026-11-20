import { detailString, isApiError } from '@/shared/api';
import { formatDate, parseApiDate } from '@/shared/lib/format';

export type PaymentBlockKind =
    | 'signin'
    | 'window-not-open'
    | 'deadline-passed'
    | 'forbidden'
    | 'not-confirmed'
    | 'settled'
    | 'not-found'
    | 'unavailable';

export interface PaymentBlock {
    kind: PaymentBlockKind;
    title: string;
    message: string;
}

const BLOCKS: Record<PaymentBlockKind, PaymentBlock> = {
    signin: {
        kind: 'signin',
        title: 'Please sign in',
        message: 'Your session has expired. Sign in again to continue with the payment.',
    },
    'window-not-open': {
        kind: 'window-not-open',
        title: 'Payment is not open yet',
        message: 'Payment opens shortly before your rental starts. Please come back closer to the start date.',
    },
    'deadline-passed': {
        kind: 'deadline-passed',
        title: 'Payment deadline has passed',
        message: 'The time to pay for this rental has run out, so it can no longer be paid. The rental is released automatically.',
    },
    forbidden: {
        kind: 'forbidden',
        title: 'Not your rental',
        message: 'You can only pay for your own rentals.',
    },
    'not-confirmed': {
        kind: 'not-confirmed',
        title: 'Rental not confirmed yet',
        message: 'Payment opens once an administrator has confirmed your rental request. Check back after it is confirmed.',
    },
    settled: {
        kind: 'settled',
        title: 'Already paid',
        message: 'The payment for this rental is already settled. There is nothing more to pay.',
    },
    'not-found': {
        kind: 'not-found',
        title: 'Rental not found',
        message: 'We could not find this rental or its payment.',
    },
    unavailable: {
        kind: 'unavailable',
        title: 'Payment unavailable',
        message: 'The payment service could not be reached. Please try again in a moment.',
    },
};

export const PAYMENT_WINDOW_ERROR_CODES: readonly string[] = ['PAYMENT_WINDOW_NOT_OPEN'];

function paymentOpensOn(error: unknown): string | undefined {
    const value = detailString(error, 'paymentOpensOn');
    if (!value) return undefined;

    return parseApiDate(value) ? formatDate(value) : undefined;
}

export function describePaymentWindow(opensOn: string | undefined): PaymentBlock {
    const label = opensOn && parseApiDate(opensOn) ? formatDate(opensOn) : undefined;

    return label ? { ...BLOCKS['window-not-open'], message: `Payment opens on ${label}.` } : BLOCKS['window-not-open'];
}

export function describeNotConfirmed(opensOn: string | undefined): PaymentBlock {
    const label = opensOn && parseApiDate(opensOn) ? formatDate(opensOn) : undefined;
    const base = BLOCKS['not-confirmed'];

    return label
        ? { ...base, message: `Payment opens once an administrator has confirmed your rental request, and not before ${label}. Approval comes first.` }
        : base;
}

function windowNotOpen(error: unknown): PaymentBlock {
    return describePaymentWindow(paymentOpensOn(error));
}

export function describePaymentError(error: unknown): PaymentBlock {
    if (!isApiError(error)) return BLOCKS.unavailable;

    if (error.code && PAYMENT_WINDOW_ERROR_CODES.includes(error.code)) {
        return windowNotOpen(error);
    }

    if (error.code === 'PAYMENT_DEADLINE_PASSED') {
        return BLOCKS['deadline-passed'];
    }

    switch (error.status) {
        case 401:
            return BLOCKS.signin;
        case 403:
            return BLOCKS.forbidden;
        case 400:
            return BLOCKS['not-confirmed'];
        case 404:
            return BLOCKS['not-found'];
        case 409:
            return BLOCKS.settled;
        default:
            return BLOCKS.unavailable;
    }
}

export const CONFIG_MISSING_BLOCK: PaymentBlock = {
    kind: 'unavailable',
    title: 'Payments are not configured',
    message: 'The Stripe test-mode publishable key is missing on this server, so the payment form cannot be shown.',
};
