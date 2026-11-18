import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DamageCurrencyTotals } from '../damage-currency-totals';

describe('DamageCurrencyTotals', () => {
    it('renders one block per currency without summing across currencies', () => {
        render(
            <DamageCurrencyTotals
                totals={[
                    { currency: 'TRY', assessedCount: 2, totalRepairCost: 1500, totalCustomerLiability: 900, averageRepairCost: 750 },
                    { currency: 'EUR', assessedCount: 1, totalRepairCost: 200, totalCustomerLiability: 100, averageRepairCost: 200 },
                ]}
            />
        );

        const tryBlock = screen.getByTestId('damage-currency-TRY');
        expect(tryBlock.textContent).toContain('2 assessed');
        expect(tryBlock.textContent).toMatch(/1[.,]500/);
        expect(screen.getByTestId('damage-currency-EUR').textContent).toContain('€');
        expect(screen.queryByTestId('damage-currency-empty')).toBeNull();
        expect(document.body.textContent).not.toContain('$');
    });

    it('shows an empty state when no report has been assessed', () => {
        render(<DamageCurrencyTotals totals={[]} />);

        expect(screen.getByTestId('damage-currency-empty')).toBeTruthy();
        expect(document.body.textContent).not.toContain('$');
    });
});
