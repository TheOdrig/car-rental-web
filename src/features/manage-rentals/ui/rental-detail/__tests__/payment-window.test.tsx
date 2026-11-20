import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { RentalStatus } from '@/entities/rental';
import { createMockRental } from '@/entities/rental/lib/testing/factories';

const clientGet = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/shared/api')>();
    return { ...actual, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { RentalDetail } from '../rental-detail';

describe('rental detail payment window', () => {
    beforeEach(() => {
        clientGet.mockReset();
        clientGet.mockResolvedValue({ paymentId: 1, rentalId: 3, status: 'PENDING', amount: 120, currency: 'USD' });
    });

    it('disables Pay now and shows the server date before the window opens', async () => {
        renderWithProviders(
            <RentalDetail rental={createMockRental({ status: RentalStatus.CONFIRMED, paymentOpensOn: '2999-03-04' })} />
        );

        expect(await screen.findByText('Payment opens on Mar 4, 2999')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Pay now' })).toBeDisabled();
    });

    it('links to the pay page once the window is open', async () => {
        renderWithProviders(
            <RentalDetail rental={createMockRental({ status: RentalStatus.CONFIRMED, paymentOpensOn: '2000-01-01' })} />
        );

        expect(await screen.findByRole('link', { name: 'Pay now' })).toBeInTheDocument();
        expect(screen.queryByText(/Payment opens on/)).not.toBeInTheDocument();
    });

    it('hides Pay now and says so when the rental is already paid', async () => {
        clientGet.mockResolvedValue({ paymentId: 1, rentalId: 3, status: 'CAPTURED', amount: 120, currency: 'USD' });
        renderWithProviders(
            <RentalDetail
                rental={createMockRental({ status: RentalStatus.CONFIRMED, paymentOpensOn: '2000-01-01', paymentStatus: 'CAPTURED' })}
            />
        );

        const card = await screen.findByTestId('rental-payment-status');
        expect(await within(card).findByText('Paid')).toBeInTheDocument();
        expect(screen.queryByTestId('rental-payment-state')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Pay (now|again)/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Pay now' })).not.toBeInTheDocument();
    });

    it('shows the pay-by time while the payment is outstanding', async () => {
        renderWithProviders(
            <RentalDetail
                rental={createMockRental({
                    status: RentalStatus.CONFIRMED,
                    paymentOpensOn: '2000-01-01',
                    paymentStatus: 'PENDING',
                    paymentDueBy: '2030-05-06T12:00:00Z',
                })}
            />
        );

        expect(await screen.findByTestId('rental-pay-by')).toHaveTextContent(/^Pay by May [5-7], 2030/);
    });

    it('says who cancelled and why', async () => {
        renderWithProviders(
            <RentalDetail
                rental={createMockRental({
                    status: RentalStatus.CANCELLED,
                    cancelledBy: 'ADMIN',
                    cancellationReason: 'Vehicle unavailable',
                })}
            />
        );

        expect(await screen.findByTestId('cancellation-by')).toHaveTextContent('Cancelled by our team');
        expect(screen.getByTestId('cancellation-reason')).toHaveTextContent('Vehicle unavailable');
    });
});
