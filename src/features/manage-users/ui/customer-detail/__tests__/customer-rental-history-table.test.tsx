import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerRentalHistoryTable } from '../customer-rental-history-table';

const mockHistory = vi.hoisted(() => vi.fn());

vi.mock('../../../api/users-api', () => ({ useCustomerRentalHistory: mockHistory }));

describe('CustomerRentalHistoryTable', () => {
    it('shows an error with retry instead of an empty history', async () => {
        const refetch = vi.fn();
        mockHistory.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });

        render(<CustomerRentalHistoryTable customerId={3} />);

        expect(screen.getByText('Failed to load rental history')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
