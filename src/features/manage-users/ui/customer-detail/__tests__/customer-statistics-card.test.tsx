import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerStatisticsCard } from '../customer-statistics-card';
import type { CustomerStatistics } from '@/entities/user';

const base: CustomerStatistics = {
    totalRentals: 5,
    completedRentals: 3,
    cancelledRentals: 1,
    activeRentals: 1,
    spentByCurrency: [],
    averageRentalDuration: 3.5,
    totalDamageReports: 2,
    damageCostByCurrency: [],
    lateReturns: 0,
    customerSinceDays: 40,
};

describe('CustomerStatisticsCard', () => {
    it('renders spending per currency without summing them', () => {
        render(
            <CustomerStatisticsCard
                statistics={{
                    ...base,
                    spentByCurrency: [
                        { currency: 'TRY', rentalCount: 2, totalSpent: 4500 },
                        { currency: 'USD', rentalCount: 1, totalSpent: 120 },
                    ],
                }}
            />
        );

        const block = screen.getByTestId('spent-by-currency');
        expect(block.textContent).toContain('TRY (2 rentals)');
        expect(block.textContent).toContain('USD (1 rental)');
        expect(block.textContent).toContain('₺4,500.00');
        expect(block.textContent).toContain('$120.00');
    });

    it('shows an empty state without spending', () => {
        render(<CustomerStatisticsCard statistics={base} />);

        expect(screen.getByText('No completed rentals yet.')).toBeTruthy();
    });

    it('renders damage cost per currency', () => {
        render(
            <CustomerStatisticsCard
                statistics={{
                    ...base,
                    damageCostByCurrency: [
                        { currency: 'TRY', assessedCount: 2, totalCustomerLiability: 1200 },
                        { currency: 'USD', assessedCount: 1, totalCustomerLiability: 80 },
                    ],
                }}
            />
        );

        const block = screen.getByTestId('damage-cost-by-currency');
        expect(block.textContent).toContain('TRY (2 assessed)');
        expect(block.textContent).toContain('USD (1 assessed)');
        expect(block.textContent).toMatch(/1[.,]200/);
    });

    it('shows an empty state without damage costs', () => {
        render(<CustomerStatisticsCard statistics={base} />);

        expect(screen.getByText('No assessed damage costs.')).toBeTruthy();
    });

    it('shows the average duration only when there is one', () => {
        const { rerender } = render(<CustomerStatisticsCard statistics={base} />);
        expect(screen.getByText('Avg. Duration')).toBeTruthy();

        rerender(<CustomerStatisticsCard statistics={{ ...base, averageRentalDuration: 0 }} />);
        expect(screen.queryByText('Avg. Duration')).toBeNull();
    });
});
