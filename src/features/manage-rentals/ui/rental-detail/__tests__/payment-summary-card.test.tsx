import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentSummaryCard, dailyRateIsRounded } from '../payment-summary-card';

describe('PaymentSummaryCard', () => {
    it('says so when the rounded daily rate does not multiply to the total', () => {
        render(<PaymentSummaryCard dailyPrice={88.49} days={3} originalPrice={265.48} totalPrice={265.48} currency="USD" />);

        expect(screen.getByTestId('rounded-daily-rate-note')).toHaveTextContent('3 × $88.49');
        expect(screen.getByText('$88.49 approx.')).toBeInTheDocument();
    });

    it('stays quiet when the numbers add up', () => {
        render(<PaymentSummaryCard dailyPrice={90} days={3} originalPrice={270} totalPrice={270} currency="USD" />);

        expect(screen.queryByTestId('rounded-daily-rate-note')).not.toBeInTheDocument();
    });

    it('accounts for savings when no original price is known', () => {
        expect(dailyRateIsRounded(100, 3, undefined, 270, 30)).toBe(false);
        expect(dailyRateIsRounded(88.49, 3, undefined, 265.48, 0)).toBe(true);
    });
});
