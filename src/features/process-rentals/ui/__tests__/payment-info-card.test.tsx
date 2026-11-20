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
        expect(screen.getByTestId('payment-due-by').closest('[data-testid="rental-payment-status"]')).not.toBeNull();
    });

    it('shows nothing when the API sends no pay-by time', () => {
        renderWithProviders(<PaymentInfoCard rentalId={9} pricing={pricing} paymentEnabled={false} />);

        expect(screen.queryByTestId('payment-due-by')).not.toBeInTheDocument();
    });
});

describe('PaymentInfoCard adjustments', () => {
    it('lists signed adjustments instead of the free-text labels', () => {
        renderWithProviders(
            <PaymentInfoCard
                rentalId={9}
                pricing={{
                    ...pricing,
                    appliedAdjustments: ['Weekend +11.3%'],
                    adjustments: [
                        { code: 'WEEKEND', label: 'Weekend surcharge', amount: 56.5 },
                        { code: 'EARLY', label: 'Early booking', amount: -25 },
                    ],
                }}
                paymentEnabled={false}
            />
        );

        const list = screen.getByTestId('price-adjustments');
        expect(list).toHaveTextContent('Weekend surcharge+$56.50');
        expect(list).toHaveTextContent('Early booking-$25.00');
        expect(screen.queryByTestId('applied-adjustments')).not.toBeInTheDocument();
    });
});

describe('PaymentInfoCard totals', () => {
    it('lists the applied adjustments and labels the total as the rental total', () => {
        renderWithProviders(
            <PaymentInfoCard
                rentalId={9}
                pricing={{ ...pricing, appliedAdjustments: ['Season -10%', 'Weekend +11.3%'] }}
                paymentEnabled={false}
            />
        );

        expect(screen.getByTestId('applied-adjustments')).toHaveTextContent('Season -10%');
        expect(screen.getByTestId('applied-adjustments')).toHaveTextContent('Weekend +11.3%');
        expect(screen.getByText('Rental Total')).toBeInTheDocument();
        expect(screen.queryByText('Base Total')).not.toBeInTheDocument();
    });

    it('omits the adjustments block when there are none', () => {
        renderWithProviders(<PaymentInfoCard rentalId={9} pricing={pricing} paymentEnabled={false} />);

        expect(screen.queryByTestId('applied-adjustments')).not.toBeInTheDocument();
    });
});
