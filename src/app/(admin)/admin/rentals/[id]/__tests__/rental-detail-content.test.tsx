import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const approve = vi.hoisted(() => vi.fn());
const refetch = vi.hoisted(() => vi.fn());
const detail = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('@/features/process-rentals', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/features/process-rentals')>();
    const idle = () => ({ mutateAsync: vi.fn(), isPending: false });
    return {
        ...original,
        useRentalDetail: () => ({ data: detail.current, isLoading: false, isError: false, refetch }),
        useApproveRental: () => ({ mutateAsync: approve, isPending: false }),
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
    return { ...original, useCancelRental: () => ({ mutateAsync: vi.fn(), isPending: false, reset: vi.fn() }) };
});
vi.mock('@/entities/payment', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/entities/payment')>();
    return { ...original, useRentalPayment: () => ({ data: undefined, isLoading: false }) };
});

import { RentalDetailContent } from '../rental-detail-content';

function rental(status: string) {
    return {
        id: 7,
        status,
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

describe('admin rental detail approval', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        detail.current = rental('PENDING');
        approve.mockResolvedValue({});
        refetch.mockImplementation(async () => {
            detail.current = rental('CONFIRMED');
            return {};
        });
    });

    it('asks for confirmation before approving and moves focus to the heading afterwards', async () => {
        const user = userEvent.setup();
        const view = render(
            <main>
                <RentalDetailContent id="7" />
            </main>
        );

        await user.click(screen.getByRole('button', { name: 'Approve' }));
        expect(approve).not.toHaveBeenCalled();

        await user.click(await screen.findByRole('button', { name: 'Approve Rental' }));
        await waitFor(() => expect(approve).toHaveBeenCalledTimes(1));

        view.rerender(
            <main>
                <RentalDetailContent id="7" />
            </main>
        );
        await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveFocus());
    });

    it('does not approve when the dialog is dismissed', async () => {
        const user = userEvent.setup();
        render(
            <main>
                <RentalDetailContent id="7" />
            </main>
        );

        await user.click(screen.getByRole('button', { name: 'Approve' }));
        await user.keyboard('{Escape}');

        expect(approve).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Approve' })).toHaveFocus();
    });
});
