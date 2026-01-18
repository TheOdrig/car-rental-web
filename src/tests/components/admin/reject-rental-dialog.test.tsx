'use client';

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RejectRentalDialog } from '@/components/admin/reject-rental-dialog';
import { renderWithProviders } from '../../test-utils';
import type { PendingItem } from '@/types/admin';

describe('RejectRentalDialog', () => {
    const user = userEvent.setup();

    const mockItem: PendingItem = {
        rentalId: 404,
        customerName: 'Bad Driver',
        customerEmail: 'bad@driver.com',
        carId: 4,
        carBrand: 'Porsche',
        carModel: '911',
        licensePlate: 'FAST-01',
        startDate: '2025-12-24T10:00:00Z',
        endDate: '2025-12-26T10:00:00Z',
        totalAmount: 1200,
        status: 'Requested',
        createdAt: '2025-12-20T09:00:00Z'
    };

    it('should render rejection warning and summary', () => {
        renderWithProviders(
            <RejectRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onReject={() => { }}
            />
        );

        expect(screen.getByText(/Reject Rental Request/i)).toBeInTheDocument();
        expect(screen.getByText(/This action will inform the customer/i)).toBeInTheDocument();
        expect(screen.getByText('Porsche 911')).toBeInTheDocument();
        expect(screen.getByText('FAST-01')).toBeInTheDocument();
        expect(screen.getByText('Bad Driver')).toBeInTheDocument();
    });

    it('should show error if reason is missing', async () => {
        const onReject = vi.fn();
        renderWithProviders(
            <RejectRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onReject={onReject}
            />
        );

        const rejectButton = screen.getByRole('button', { name: /Reject Request/i });
        await user.click(rejectButton);

        expect(screen.getByText(/Please provide a reason/i)).toBeInTheDocument();
        expect(onReject).not.toHaveBeenCalled();
    });

    it('should call onReject with reason when valid', async () => {
        const onReject = vi.fn();
        renderWithProviders(
            <RejectRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onReject={onReject}
            />
        );

        const reasonField = screen.getByPlaceholderText(/Please explain the reason for rejection/i);
        await user.type(reasonField, 'Vehicle unavailable due to unexpected maintenance.');

        const rejectButton = screen.getByRole('button', { name: /Reject Request/i });
        await user.click(rejectButton);

        expect(onReject).toHaveBeenCalledWith(404, 'Vehicle unavailable due to unexpected maintenance.');
    });

    it('should show loading state', () => {
        renderWithProviders(
            <RejectRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onReject={() => { }}
                isLoading={true}
            />
        );

        expect(screen.getByText(/Rejecting.../i)).toBeInTheDocument();
    });
});
