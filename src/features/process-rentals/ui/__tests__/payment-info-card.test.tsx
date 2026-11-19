import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { PaymentInfoCard } from '@/features/process-rentals';
import { renderWithProviders } from '@/app/testing/test-utils';
import type { RentalPricing } from '@/entities/rental';

const pricing: RentalPricing = {
    dailyRate: 100,
    totalDays: 5,
    subtotal: 500,
    discounts: 0,
    finalTotal: 500,
    currency: 'USD',
};

describe('PaymentInfoCard pay-by', () => {
    it('shows the local pay-by time while the rental waits for payment', () => {
        renderWithProviders(
            <PaymentInfoCard rentalId={9} pricing={pricing} paymentEnabled={false} paymentDueBy="2030-05-06T12:00:00Z" />
        );

        expect(screen.getByTestId('payment-due-by')).toHaveTextContent(/^Pay by May [5-7], 2030/);
    });

    it('shows nothing when the API sends no pay-by time', () => {
        renderWithProviders(<PaymentInfoCard rentalId={9} pricing={pricing} paymentEnabled={false} />);

        expect(screen.queryByTestId('payment-due-by')).not.toBeInTheDocument();
    });
});
