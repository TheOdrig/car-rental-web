import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../dashboard';

const mockUseMyRentals = vi.hoisted(() => vi.fn());

vi.mock('@/entities/rental', async () => {
    const actual = await vi.importActual<typeof import('@/entities/rental')>('@/entities/rental');
    return { ...actual, useMyRentals: mockUseMyRentals };
});

describe('Dashboard widget', () => {
    it('shows an error instead of zero rentals when loading fails', async () => {
        const refetch = vi.fn();
        mockUseMyRentals.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });

        render(<Dashboard />);

        expect(screen.getByText('Failed to load your rentals')).toBeInTheDocument();
        expect(screen.queryByText('Total Rentals')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
