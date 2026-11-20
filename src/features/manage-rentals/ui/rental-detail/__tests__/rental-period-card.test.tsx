import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RentalPeriodCard } from '../rental-period-card';

describe('RentalPeriodCard', () => {
    it('shows the real return date when the rental ended early', () => {
        render(<RentalPeriodCard startDate="2030-01-10" endDate="2030-01-15" days={5} returnedAt="2030-01-11T12:00:00" />);

        expect(screen.getByText('Returned')).toBeInTheDocument();
        expect(screen.getByText('Jan 11, 2030')).toBeInTheDocument();
        expect(screen.getByText('Booked until Jan 15, 2030')).toBeInTheDocument();
    });

    it('keeps the booked end date when the return was on time or is unknown', () => {
        const { rerender } = render(<RentalPeriodCard startDate="2030-01-10" endDate="2030-01-15" days={5} />);
        expect(screen.getByText('Return')).toBeInTheDocument();
        expect(screen.getByText('Jan 15, 2030')).toBeInTheDocument();

        rerender(<RentalPeriodCard startDate="2030-01-10" endDate="2030-01-15" days={5} returnedAt="2030-01-15T09:00:00" />);
        expect(screen.queryByText(/Booked until/)).not.toBeInTheDocument();
    });
});
