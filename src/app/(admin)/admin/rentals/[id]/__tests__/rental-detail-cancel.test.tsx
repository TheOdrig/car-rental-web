import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api';

const cancel = vi.hoisted(() => vi.fn());
const cancelState = vi.hoisted(() => ({ error: null as unknown }));
const refetch = vi.hoisted(() => vi.fn());

vi.mock('@/features/process-rentals', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/features/process-rentals')>();
    const idle = () => ({ mutateAsync: vi.fn(), isPending: false });
    return {
        ...original,
        useRentalDetail: () => ({ data: rental(), isLoading: false, isError: false, refetch }),
        useApproveRental: idle,
        useRejectRental: idle,
        useProcessPickup: idle,
        useProcessReturn: idle,
        useProcessEarlyReturn: idle,
        useEarlyReturnPreview: () => ({ data: undefined }),
        RentalInfoCard: () => null,
        CustomerInfoCard: () => null,
        VehicleInfoCard: () => null,
        PaymentInfoCard: () => null,
        TimelineCard: () => null,
    };
});
vi.mock('@/entities/rental', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/entities/rental')>();
    return {
        ...original,
        useCancelRental: () => ({ mutateAsync: cancel, isPending: false, error: cancelState.error, reset: vi.fn() }),
    };
});
vi.mock('@/entities/payment', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/entities/payment')>();
    return { ...original, useRentalPayment: () => ({ data: undefined, isLoading: false }) };
});

import { RentalDetailContent } from '../rental-detail-content';

function rental() {
    return {
        id: 7,
        status: 'CONFIRMED',
        startDate: '2030-01-10',
        endDate: '2030-01-12',
        duration: 2,
        customer: { firstName: 'Ada', lastName: 'Lovelace', emailVerified: true, phoneVerified: false },
        vehicle: { id: 3, brand: 'Honda', model: 'Civic' },
        pricing: { currency: 'EUR', totalAmount: 100 },
        notes: {},
        timeline: [],
        damages: [],
    };
}

async function openCancelDialog(user: ReturnType<typeof userEvent.setup>) {
    render(
        <main>
            <RentalDetailContent id="7" />
        </main>
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
}

describe('admin rental cancellation reason', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cancelState.error = null;
        cancel.mockResolvedValue({});
        refetch.mockResolvedValue({});
    });

    it('sends the typed reason with the cancellation', async () => {
        const user = userEvent.setup();
        await openCancelDialog(user);

        await user.type(await screen.findByLabelText('Reason (optional)'), 'Car is in the workshop');
        await user.click(screen.getByRole('button', { name: 'Cancel Rental' }));

        await waitFor(() => expect(cancel).toHaveBeenCalledWith({ rentalId: 7, reason: 'Car is in the workshop' }));
    });

    it('lets the admin cancel without a reason', async () => {
        const user = userEvent.setup();
        await openCancelDialog(user);

        await user.click(await screen.findByRole('button', { name: 'Cancel Rental' }));

        await waitFor(() => expect(cancel).toHaveBeenCalledWith({ rentalId: 7, reason: '' }));
    });

    it('counts the length and blocks a reason over 500 characters', async () => {
        const user = userEvent.setup();
        await openCancelDialog(user);

        const field = await screen.findByLabelText('Reason (optional)');
        await user.click(field);
        await user.paste('x'.repeat(501));

        expect(screen.getByText('501/500')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('at most 500 characters');
        expect(screen.getByRole('button', { name: 'Cancel Rental' })).toBeDisabled();
    });

    it('shows the API field error under the reason', async () => {
        cancelState.error = new ApiError({
            status: 400,
            message: 'Validation failed',
            timestamp: new Date().toISOString(),
            code: 'VALIDATION_FAILED',
            errors: [{ field: 'reason', message: 'size must be between 0 and 500' }],
        });
        const user = userEvent.setup();
        await openCancelDialog(user);

        expect(await screen.findByRole('alert')).toHaveTextContent('size must be between 0 and 500');
    });
});
