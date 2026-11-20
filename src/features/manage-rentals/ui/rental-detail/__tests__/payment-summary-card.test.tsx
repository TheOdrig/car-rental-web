import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentSummaryCard, dailyRateIsRounded } from '../payment-summary-card';

describe('PaymentSummaryCard', () => {
    it('says so when the rounded daily rate does not multiply to the total', () => {
        render(<PaymentSummaryCard dailyPrice={88.49} days={3} originalPrice={265.48} totalPrice={265.48} currency="USD" />);

        expect(screen.getByTestId('rounded-daily-rate-note')).toHaveTextContent('3 × $88.49');
        expect(screen.getByText('$88.49')).toBeInTheDocument();
    });

    it('stays quiet when the numbers add up', () => {
        render(<PaymentSummaryCard dailyPrice={90} days={3} originalPrice={270} totalPrice={270} currency="USD" />);

        expect(screen.queryByTestId('rounded-daily-rate-note')).not.toBeInTheDocument();
    });

    it('lists every price adjustment so the total visibly adds up', () => {
        render(
            <PaymentSummaryCard
                dailyPrice={100}
                days={3}
                originalPrice={300}
                totalPrice={294.3}
                totalSavings={20}
                adjustments={[
                    { code: 'WEEKEND', label: 'Weekend surcharge', amount: 33.9 },
                    { code: 'LONG_STAY', label: 'Long rental discount', amount: -39.6 },
                    { code: 'SEASON', label: 'Season', amount: 0 },
                ]}
                currency="EUR"
            />
        );

        const list = screen.getByTestId('price-adjustments');
        expect(list).toHaveTextContent('Weekend surcharge+€33.90');
        expect(list).toHaveTextContent('Long rental discount-€39.60');
        expect(list).not.toHaveTextContent('Season');
        expect(screen.queryByText('Savings')).not.toBeInTheDocument();
    });

    it('keeps the savings line for older rentals without adjustments', () => {
        render(<PaymentSummaryCard dailyPrice={100} days={3} originalPrice={300} totalPrice={280} totalSavings={20} currency="EUR" />);

        expect(screen.queryByTestId('price-adjustments')).not.toBeInTheDocument();
        expect(screen.getByText('Savings')).toBeInTheDocument();
    });

    it('accounts for savings when no original price is known', () => {
        expect(dailyRateIsRounded(100, 3, undefined, 270, 30)).toBe(false);
        expect(dailyRateIsRounded(88.49, 3, undefined, 265.48, 0)).toBe(true);
    });
});
