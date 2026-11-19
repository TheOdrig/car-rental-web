import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { RentalStatus } from '@/entities/rental';
import { createMockRental } from '@/entities/rental/lib/testing/factories';
import { PaymentSummaryCard } from '../payment-summary-card';
import { RentalDetail } from '../rental-detail';

describe('rental detail actions', () => {
    it('shows no support, modify or invoice buttons that only toast', () => {
        renderWithProviders(<RentalDetail rental={createMockRental({ status: RentalStatus.REQUESTED })} />);

        expect(screen.queryByRole('button', { name: /support/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /modify dates/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /download invoice/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it.each([RentalStatus.IN_USE, RentalStatus.RETURNED])('hides the customer cancel button for a %s rental', (status) => {
        renderWithProviders(<RentalDetail rental={createMockRental({ status })} />);

        expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('renders the payment summary without an invoice download', () => {
        renderWithProviders(<PaymentSummaryCard dailyPrice={50} days={3} totalPrice={150} currency="USD" />);

        expect(screen.getByText('Payment Summary')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
