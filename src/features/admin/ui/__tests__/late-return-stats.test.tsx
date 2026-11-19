import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LateReturnStats } from '../late-return-stats';

const data = {
    totalLateReturns: 5,
    severelyLateCount: 1,
    averageLateHours: 4.25,
    lateReturnPercentage: 12.5,
    penaltiesByCurrency: [
        { currency: 'USD' as const, totalPenaltyAmount: 300, collectedPenaltyAmount: 200, pendingPenaltyAmount: 100 },
        { currency: 'TRY' as const, totalPenaltyAmount: 1500, collectedPenaltyAmount: 0, pendingPenaltyAmount: 1500 },
    ],
};

describe('LateReturnStats', () => {
    it('shows the penalty totals once per currency without adding them up', () => {
        render(<LateReturnStats data={data} />);

        expect(screen.getByText('Total Penalties (USD)')).toBeInTheDocument();
        expect(screen.getByText('$300.00')).toBeInTheDocument();
        expect(screen.getByText('Pending (TRY)')).toBeInTheDocument();
        expect(screen.getAllByText('₺1,500.00')).toHaveLength(2);
        expect(screen.queryByText(/1,800/)).not.toBeInTheDocument();
    });

    it('shows the counts and rates without a penalty section when there are no penalties', () => {
        render(<LateReturnStats data={{ ...data, penaltiesByCurrency: [] }} />);

        expect(screen.getByText('Total Late Returns')).toBeInTheDocument();
        expect(screen.getByText('12.5%')).toBeInTheDocument();
        expect(screen.queryByText(/Total Penalties/)).not.toBeInTheDocument();
    });
});
