'use client';

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessPickupDialog } from '@/components/admin/process-pickup-dialog';
import { renderWithProviders } from '../../test-utils';
import type { PendingItem } from '@/types/admin';

describe('ProcessPickupDialog', () => {
    const user = userEvent.setup();

    const mockItem: PendingItem = {
        rentalId: 202,
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        carId: 2,
        carBrand: 'BMW',
        carModel: 'X5',
        licensePlate: 'XYZ-5678',
        startDate: '2025-12-10T09:00:00Z',
        endDate: '2025-12-15T09:00:00Z',
        totalAmount: 750,
        status: 'Confirmed',
        createdAt: '2025-12-01T08:00:00Z'
    };

    it('should render pickup summary and checklist', () => {
        renderWithProviders(
            <ProcessPickupDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={() => { }}
            />
        );

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('BMW X5')).toBeInTheDocument();
        expect(screen.getByText('XYZ-5678')).toBeInTheDocument();
        expect(screen.getByText(/RENT-202/)).toBeInTheDocument();

        
        expect(screen.getByLabelText(/Customer ID Verified/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Vehicle condition inspected/i)).toBeInTheDocument();
    });

    it('should show error message if checklist is incomplete', async () => {
        const onConfirm = vi.fn();
        renderWithProviders(
            <ProcessPickupDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={onConfirm}
            />
        );

        const confirmButton = screen.getByRole('button', { name: /Confirm Pickup/i });
        await user.click(confirmButton);

        expect(screen.getByText(/Please complete all checklist items/i)).toBeInTheDocument();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm when checklist is complete', async () => {
        const onConfirm = vi.fn();
        renderWithProviders(
            <ProcessPickupDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={onConfirm}
            />
        );

        await user.click(screen.getByLabelText(/Customer ID Verified/i));
        await user.click(screen.getByLabelText(/Vehicle condition inspected/i));

        const notesField = screen.getByPlaceholderText(/Add any observations/i);
        await user.type(notesField, 'Fuel is at 90%.');

        const confirmButton = screen.getByRole('button', { name: /Confirm Pickup/i });
        await user.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledWith(202, 'Fuel is at 90%.');
    });

    it('should show loading state', () => {
        renderWithProviders(
            <ProcessPickupDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={() => { }}
                isLoading={true}
            />
        );

        expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
    });
});
