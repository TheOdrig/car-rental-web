import { isPaymentSecured } from '@/entities/payment';
import {
    isAfterRentalEnd,
    isAwaitingPickup,
    isPenaltyHistoryStatus,
    isBeforeRentalStart,
    PICKUP_AFTER_END_MESSAGE,
    PICKUP_BEFORE_START_MESSAGE,
    PICKUP_PAYMENT_REQUIRED_MESSAGE,
    type RentalDetailResponse,
    type TimelineEventType,
} from '@/entities/rental';
import { personDisplayName } from '@/shared/lib';

export type ConfirmableAction = 'approve' | 'pickup' | 'return' | 'earlyReturn' | 'cancel';

export const CONFIRM_COPY = {
    approve: {
        title: 'Approve this rental request?',
        description: 'The customer is notified and can pay once the payment window opens. This cannot be undone.',
        confirm: 'Confirm Approval',
    },
    pickup: {
        title: 'Hand the vehicle over?',
        description: 'This records the pickup and captures the customer payment that was authorized for this rental.',
        confirm: 'Confirm Pickup',
    },
    return: {
        title: 'Record the return?',
        description: 'This closes the rental and makes the vehicle available again. Late penalties, if any, are calculated from the return time.',
        confirm: 'Confirm Return',
    },
    earlyReturn: {
        title: 'Return the vehicle early?',
        description: 'The rental ends today and the unused days are refunded to the customer according to the rental rules. This cannot be undone.',
        confirm: 'Return Early',
    },
    cancel: {
        title: 'Cancel this rental?',
        description: 'The customer is notified and any authorized payment is released. This cannot be undone.',
        confirm: 'Cancel Rental',
    },
} as const satisfies Record<ConfirmableAction, { title: string; description: string; confirm: string }>;

export const REJECT_COPY = {
    title: 'Reject Rental Request',
    description: 'Please provide a reason for rejecting this rental request. The customer is notified.',
    placeholder: 'Enter rejection reason...',
    confirm: 'Confirm Rejection',
    pending: 'Rejecting...',
    dismiss: 'Cancel',
} as const;

export function hasPenalty(rental: Pick<RentalDetailResponse, 'penaltyAmount'>): boolean {
    return (rental.penaltyAmount ?? 0) > 0;
}

export function shouldShowPenaltyHistory(rental: Pick<RentalDetailResponse, 'penaltyAmount' | 'status'>): boolean {
    return !hasPenalty(rental) && isPenaltyHistoryStatus(rental.status);
}

export function getPickupBlockedReason(
    rental: Pick<RentalDetailResponse, 'status' | 'startDate' | 'endDate'>,
    payment: { isLoading: boolean; status: Parameters<typeof isPaymentSecured>[0] },
): string | undefined {
    if (!isAwaitingPickup(rental.status)) return undefined;
    if (isBeforeRentalStart(rental.startDate)) return PICKUP_BEFORE_START_MESSAGE;
    if (isAfterRentalEnd(rental.endDate)) return PICKUP_AFTER_END_MESSAGE;
    if (!payment.isLoading && !isPaymentSecured(payment.status)) return PICKUP_PAYMENT_REQUIRED_MESSAGE;
    return undefined;
}

export function toCustomerInfo(customer: RentalDetailResponse['customer']) {
    return {
        ...customer,
        name: personDisplayName(customer),
        isEmailVerified: customer.emailVerified,
        isPhoneVerified: customer.phoneVerified,
        isVerified: customer.emailVerified,
    };
}

export function toVehicleInfo(vehicle: RentalDetailResponse['vehicle']) {
    return { ...vehicle, name: `${vehicle.brand} ${vehicle.model}` };
}

export function toTimelineEvents(timeline: RentalDetailResponse['timeline']) {
    return timeline.map((event, index) => ({
        ...event,
        id: index,
        type: event.type as TimelineEventType,
        title: event.title || 'Status Update',
        description: event.description || '',
    }));
}

export function findTimelineTimestamp(timeline: RentalDetailResponse['timeline'], type: string): string | undefined {
    return timeline.find((event) => event.type === type)?.timestamp;
}
