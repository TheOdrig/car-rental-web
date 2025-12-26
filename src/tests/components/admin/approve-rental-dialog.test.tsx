'use client';

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApproveRentalDialog } from '@/components/admin/approve-rental-dialog';
import { renderWithProviders } from '../../test-utils';
import type { PendingItem } from '@/types/admin';

describe('ApproveRentalDialog', () => {
    const user = userEvent.setup();

    const mockItem: PendingItem = {
        rentalId: 101,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerImage: '/avatars/john.jpg',
        isCustomerVerified: true,
        carId: 1,
        carBrand: 'Tesla',
        carModel: 'Model 3',
        carImage: '/cars/tesla.jpg',
        licensePlate: 'ABC-1234',
        fuelType: 'Electric',
        transmission: 'Automatic',
        startDate: '2025-12-01T10:00:00Z',
        endDate: '2025-12-05T10:00:00Z',
        duration: 4,
        totalAmount: 480,
        status: 'Requested',
        createdAt: '2025-11-25T14:00:00Z'
    };

    it('should render detailed vehicle and customer information', () => {
        renderWithProviders(
            <ApproveRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onApprove={() => { }}
            />
        );

        // Vehicle info
        expect(screen.getByText(/Tesla Model 3/i)).toBeInTheDocument();
        expect(screen.getByText(/ABC-1234/i)).toBeInTheDocument();
        expect(screen.getByText(/Electric/i)).toBeInTheDocument();
        expect(screen.getByText(/Automatic/i)).toBeInTheDocument();

        // Customer info
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/ID Verified/i)).toBeInTheDocument();

        // Rental details
        expect(screen.getByText(/4 Days/i)).toBeInTheDocument();
        expect(screen.getByText(/\$480/i)).toBeInTheDocument();
    });

    it('should call onApprove with notes when approve button is clicked', async () => {
        const onApprove = vi.fn();
        renderWithProviders(
            <ApproveRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onApprove={onApprove}
            />
        );

        const notesField = screen.getByPlaceholderText(/Add any internal notes/i);
        await user.type(notesField, 'Customer is a regular renter.');

        const approveButton = screen.getByRole('button', { name: /Approve Request/i });
        await user.click(approveButton);

        expect(onApprove).toHaveBeenCalledWith(101, 'Customer is a regular renter.');
    });

    it('should handle empty notes', async () => {
        const onApprove = vi.fn();
        renderWithProviders(
            <ApproveRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onApprove={onApprove}
            />
        );

        const approveButton = screen.getByRole('button', { name: /Approve Request/i });
        await user.click(approveButton);

        expect(onApprove).toHaveBeenCalledWith(101, '');
    });

    it('should show loading state on buttons when isLoading is true', () => {
        renderWithProviders(
            <ApproveRentalDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onApprove={() => { }}
                isLoading={true}
            />
        );

        expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });

    it('should call onOpenChange(false) when cancelled', async () => {
        const onOpenChange = vi.fn();
        renderWithProviders(
            <ApproveRentalDialog
                open={true}
                onOpenChange={onOpenChange}
                item={mockItem}
                onApprove={() => { }}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        await user.click(cancelButton);

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
