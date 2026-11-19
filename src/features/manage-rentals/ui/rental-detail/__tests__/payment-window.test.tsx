import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { RentalStatus } from '@/entities/rental';
import { createMockRental } from '@/entities/rental/lib/testing/factories';

const clientGet = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/shared/api')>();
    return { ...actual, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { RentalDetail } from '../rental-detail';

describe('rental detail payment window', () => {
    beforeEach(() => {
        clientGet.mockReset();
        clientGet.mockResolvedValue({ paymentId: 1, rentalId: 3, status: 'PENDING', amount: 120, currency: 'USD' });
    });

    it('disables Pay now and shows the server date before the window opens', async () => {
        renderWithProviders(
            <RentalDetail rental={createMockRental({ status: RentalStatus.CONFIRMED, paymentOpensOn: '2999-03-04' })} />
        );

        expect(await screen.findByText('Payment opens on Mar 4, 2999')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Pay now' })).toBeDisabled();
    });

    it('links to the pay page once the window is open', async () => {
        renderWithProviders(
            <RentalDetail rental={createMockRental({ status: RentalStatus.CONFIRMED, paymentOpensOn: '2000-01-01' })} />
        );

        expect(await screen.findByRole('link', { name: 'Pay now' })).toBeInTheDocument();
        expect(screen.queryByText(/Payment opens on/)).not.toBeInTheDocument();
    });
});
