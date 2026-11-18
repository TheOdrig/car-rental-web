import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerStatisticsCard } from '../customer-statistics-card';
import type { CustomerStatistics } from '@/entities/user';

const base: CustomerStatistics = {
    totalRentals: 5,
    completedRentals: 3,
    cancelledRentals: 1,
    activeRentals: 1,
    totalSpent: 4500,
    averageRentalDuration: 3.5,
    totalDamageReports: 2,
    damageCostByCurrency: [],
    lateReturns: 0,
    customerSinceDays: 40,
};

describe('CustomerStatisticsCard', () => {
    it('labels total spent as mixed currencies and shows no currency symbol', () => {
        render(<CustomerStatisticsCard statistics={base} />);

        expect(screen.getByText('Total Spent (mixed currencies)')).toBeTruthy();
        expect(screen.getByText('4,500.00')).toBeTruthy();
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
});
