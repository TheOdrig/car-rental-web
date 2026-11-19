import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { createMockRental } from '@/entities/rental/lib/testing/factories';
import type { RentalStatus } from '@/entities/rental';
import { RentalCard } from '../rental-card';

const confirmed = (overrides: Parameters<typeof createMockRental>[0] = {}) =>
    createMockRental({ status: 'CONFIRMED' as RentalStatus, paymentOpensOn: '2000-01-01', ...overrides });

describe('RentalCard payment state', () => {
    it('offers Pay Now and the deadline while the payment is open', () => {
        renderWithProviders(
            <RentalCard
                rental={confirmed({ paymentStatus: 'PENDING', paymentDueBy: '2030-05-06T12:00:00Z' })}
                variant="detailed"
                showActions
            />
        );

        expect(screen.getByRole('button', { name: 'Pay Now' })).toBeInTheDocument();
        expect(screen.getByTestId('rental-pay-by')).toHaveTextContent(/^Pay by May [5-7], 2030/);
    });

    it.each([
        ['AUTHORIZED', 'Payment authorized'],
        ['CAPTURED', 'Paid'],
    ] as const)('hides Pay Now and the deadline once the payment is %s', (paymentStatus, label) => {
        renderWithProviders(
            <RentalCard
                rental={confirmed({ paymentStatus, paymentDueBy: '2030-05-06T12:00:00Z' })}
                variant="detailed"
                showActions
            />
        );

        expect(screen.queryByRole('button', { name: 'Pay Now' })).not.toBeInTheDocument();
        expect(screen.queryByTestId('rental-pay-by')).not.toBeInTheDocument();
        expect(screen.getByTestId('rental-payment-state')).toHaveTextContent(label);
    });

    it('shows no deadline when the API sends none', () => {
        renderWithProviders(<RentalCard rental={confirmed({ paymentStatus: 'PENDING' })} />);

        expect(screen.queryByTestId('rental-pay-by')).not.toBeInTheDocument();
        expect(screen.queryByTestId('rental-payment-state')).not.toBeInTheDocument();
    });
});
