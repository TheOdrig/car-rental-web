import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/error';

const clientGet = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/shared/api')>();
    return { ...actual, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { RentalPaymentStatus } from '../rental-payment-status';

function renderStatus(action?: Parameters<typeof RentalPaymentStatus>[0]['action']) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <RentalPaymentStatus rentalId={3} action={action} />
        </QueryClientProvider>
    );
}

describe('RentalPaymentStatus', () => {
    beforeEach(() => {
        clientGet.mockReset();
    });

    it('shows the status and the amount', async () => {
        clientGet.mockResolvedValue({ paymentId: 1, rentalId: 3, status: 'AUTHORIZED', amount: 120, currency: 'USD' });

        renderStatus();

        expect(await screen.findByText('Authorized')).toBeInTheDocument();
        expect(screen.getByText('$120.00')).toBeInTheDocument();
        expect(screen.queryByText('Refunded')).not.toBeInTheDocument();
    });

    it('shows refunded amounts', async () => {
        clientGet.mockResolvedValue({
            paymentId: 1,
            rentalId: 3,
            status: 'REFUNDED',
            amount: 120,
            currency: 'USD',
            refundedAmount: 45.5,
        });

        renderStatus();

        expect(await screen.findByText('$45.50')).toBeInTheDocument();
        expect(screen.getAllByText('Refunded').length).toBeGreaterThan(0);
    });

    it('shows the failure reason of a failed payment', async () => {
        clientGet.mockResolvedValue({
            paymentId: 1,
            rentalId: 3,
            status: 'FAILED',
            amount: 120,
            currency: 'USD',
            failureReason: 'Card declined',
        });

        renderStatus();

        expect(await screen.findByText('Card declined')).toBeInTheDocument();
    });

    it('explains that no payment exists yet on a 404 and passes undefined to the action', async () => {
        clientGet.mockRejectedValue(new ApiError(404, 'missing'));
        const action = vi.fn(() => <button>Pay now</button>);

        renderStatus(action);

        expect(await screen.findByText(/No payment has been started/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Pay now' })).toBeInTheDocument();
        expect(action).toHaveBeenCalledWith(undefined);
    });

    it('shows an error for other failures and hides the action', async () => {
        clientGet.mockRejectedValue(new ApiError(403, 'boom'));
        const action = vi.fn(() => <button>Pay now</button>);

        renderStatus(action);

        expect(await screen.findByRole('alert')).toHaveTextContent('Payment status could not be loaded.');
        expect(screen.queryByRole('button', { name: 'Pay now' })).not.toBeInTheDocument();
    });
});

describe('RentalPaymentStatus when no payment can exist yet', () => {
    it('does not request the payment and says none was started', () => {
        clientGet.mockReset();
        const client = new QueryClient();
        render(
            <QueryClientProvider client={client}>
                <RentalPaymentStatus rentalId={3} enabled={false} />
            </QueryClientProvider>
        );

        expect(clientGet).not.toHaveBeenCalled();
        expect(screen.getByText('No payment has been started for this rental yet.')).toBeInTheDocument();
    });
});
