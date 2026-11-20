import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';
import { createMockRental } from '@/entities/rental/lib/testing/factories';
import type { RentalStatus } from '@/entities/rental';
import { RentalCard } from '../rental-card';

const confirmed = () =>
    createMockRental({ id: 9, status: 'CONFIRMED' as RentalStatus, paymentOpensOn: '2000-01-01', paymentStatus: 'PENDING' });

describe('RentalCard structure', () => {
    it('keeps buttons outside the link and names the link after the vehicle', () => {
        renderWithProviders(<RentalCard rental={confirmed()} variant="detailed" showActions />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/rentals/9');
        expect(link.querySelector('button')).toBeNull();
        expect(link.closest('button')).toBeNull();
        expect(screen.getByRole('button', { name: 'Pay Now' }).closest('a')).toBeNull();
    });

    it('runs the action without following the link', async () => {
        const onAction = vi.fn();
        renderWithProviders(<RentalCard rental={confirmed()} variant="detailed" showActions onAction={onAction} />);

        await userEvent.click(screen.getByRole('button', { name: 'Pay Now' }));

        expect(onAction).toHaveBeenCalledWith('pay', expect.objectContaining({ id: 9 }));
    });

    it('renders no link when the whole card is a click target', () => {
        renderWithProviders(<RentalCard rental={confirmed()} onClick={vi.fn()} />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
