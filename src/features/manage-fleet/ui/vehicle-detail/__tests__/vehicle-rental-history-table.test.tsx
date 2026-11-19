import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleRentalHistoryTable } from '../vehicle-rental-history-table';

const mockHistory = vi.hoisted(() => vi.fn());

vi.mock('../../../api/fleet-api', () => ({ useVehicleRentalHistory: mockHistory }));

describe('VehicleRentalHistoryTable', () => {
    it('shows an error with retry instead of an empty history', async () => {
        const refetch = vi.fn();
        mockHistory.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });

        render(<VehicleRentalHistoryTable vehicleId={3} />);

        expect(screen.getByText('Failed to load rental history')).toBeInTheDocument();
        expect(screen.queryByText(/no rental history/i)).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
