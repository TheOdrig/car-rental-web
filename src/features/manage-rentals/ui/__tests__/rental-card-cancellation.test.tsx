import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { createMockRental } from '@/entities/rental/lib/testing/factories';
import type { RentalStatus } from '@/entities/rental';
import { RentalCard } from '../rental-card';

const EXPIRED_REASON = 'Request expired without approval';

describe('RentalCard cancellation reason', () => {
    it.each(['default', 'detailed'] as const)('shows the reason of a cancelled rental in the %s variant', (variant) => {
        const rental = createMockRental({
            status: 'Cancelled' as RentalStatus,
            cancellationReason: EXPIRED_REASON,
        });

        renderWithProviders(<RentalCard rental={rental} variant={variant} />);

        expect(screen.getByTestId('cancellation-reason')).toHaveTextContent(EXPIRED_REASON);
    });

    it('hides the reason when the rental is not cancelled', () => {
        const rental = createMockRental({
            status: 'Confirmed' as RentalStatus,
            cancellationReason: EXPIRED_REASON,
        });

        renderWithProviders(<RentalCard rental={rental} />);

        expect(screen.queryByTestId('cancellation-reason')).not.toBeInTheDocument();
    });

    it('hides the line when a cancelled rental has no reason', () => {
        const rental = createMockRental({ status: 'Cancelled' as RentalStatus });

        renderWithProviders(<RentalCard rental={rental} />);

        expect(screen.queryByTestId('cancellation-reason')).not.toBeInTheDocument();
    });
});
