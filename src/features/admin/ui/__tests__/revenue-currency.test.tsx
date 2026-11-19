import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardMetricsGrid, RevenueChart } from '@/features/admin';
import type { RevenueBreakdown } from '@/features/admin';

function breakdown(overrides: Partial<RevenueBreakdown>): RevenueBreakdown {
    return {
        currency: 'TRY',
        rentalRevenue: 8000,
        penaltyRevenue: 500,
        damageRecovered: 300,
        damageRepairCosts: 200,
        netDamageImpact: 100,
        totalRevenue: 8800,
        netRevenue: 8700,
        rentalPercentage: 90.9,
        penaltyPercentage: 5.7,
        damagePercentage: 3.4,
        ...overrides,
    };
}

describe('dashboard revenue by currency', () => {
    it('shows one revenue figure per currency and never a combined one', () => {
        render(
            <DashboardMetricsGrid
                revenueByCurrency={[
                    { currency: 'TRY', totalRevenue: 8800 },
                    { currency: 'USD', totalRevenue: 250 },
                ]}
            />
        );

        expect(screen.getByText(/₺8\.800/)).toBeInTheDocument();
        expect(screen.getByText('$250')).toBeInTheDocument();
        expect(screen.queryByText(/9\.050|9,050/)).not.toBeInTheDocument();
    });

    it('formats the chart total and the breakdown in the currency of the block', () => {
        render(
            <RevenueChart
                currency="EUR"
                data={[
                    { month: 'Jan', revenue: 1000 },
                    { month: 'Feb', revenue: 2500, isCurrent: true },
                ]}
                breakdown={breakdown({ currency: 'EUR', rentalRevenue: 3000, netRevenue: 3400 })}
            />
        );

        expect(screen.getByText('Revenue Trends (EUR)')).toBeInTheDocument();
        expect(screen.getByText('€3,500')).toBeInTheDocument();
        expect(screen.getByText('€3,000')).toBeInTheDocument();
        expect(screen.getByText('€3,400')).toBeInTheDocument();
        expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
});
