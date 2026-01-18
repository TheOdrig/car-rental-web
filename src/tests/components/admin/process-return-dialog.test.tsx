'use client';

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessReturnDialog } from '@/components/admin/process-return-dialog';
import { renderWithProviders } from '../../test-utils';
import type { PendingItem } from '@/types/admin';

describe('ProcessReturnDialog', () => {
    const user = userEvent.setup();

    const mockItem: PendingItem = {
        rentalId: 303,
        customerName: 'Alice Cooper',
        customerEmail: 'alice@example.com',
        carId: 3,
        carBrand: 'Audi',
        carModel: 'A4',
        licensePlate: 'AUD-9999',
        startDate: '2025-12-15T12:00:00Z',
        endDate: '2025-12-20T12:00:00Z',
        totalAmount: 600,
        status: 'In Use',
        createdAt: '2025-12-10T11:00:00Z'
    };

    it('should render return details and summary', () => {
        renderWithProviders(
            <ProcessReturnDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={() => { }}
            />
        );

        expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
        expect(screen.getByText('Audi A4')).toBeInTheDocument();
        expect(screen.getByLabelText(/Odometer Reading/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Fuel Level/i)).toBeInTheDocument();
    });

    it('should validate odometer reading', async () => {
        const onConfirm = vi.fn();
        renderWithProviders(
            <ProcessReturnDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={onConfirm}
            />
        );

        const confirmButton = screen.getByRole('button', { name: /Complete Return/i });
        await user.click(confirmButton);

        expect(screen.getByText(/Please provide the odometer reading/i)).toBeInTheDocument();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm with correct return data', async () => {
        const onConfirm = vi.fn();
        renderWithProviders(
            <ProcessReturnDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={onConfirm}
            />
        );

        
        const odometerInput = screen.getByLabelText(/Odometer Reading/i);
        await user.type(odometerInput, '15200');

        
        await user.click(screen.getByLabelText(/No new damages found/i)); 

        const confirmButton = screen.getByRole('button', { name: /Complete Return/i });
        await user.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledWith(303, {
            odometerReading: 15200,
            fuelLevel: 'full',
            noNewDamages: false,
            interiorCleaned: true,
            notes: ''
        });
    });

    it('should show damage report button when new damages are unchecked', async () => {
        const onReportDamage = vi.fn();
        renderWithProviders(
            <ProcessReturnDialog
                open={true}
                onOpenChange={() => { }}
                item={mockItem}
                onConfirm={() => { }}
                onReportDamage={onReportDamage}
            />
        );

        await user.click(screen.getByLabelText(/No new damages found/i));

        const damageButton = screen.getByRole('button', { name: /Create Damage Report/i });
        expect(damageButton).toBeInTheDocument();

        await user.click(damageButton);
        expect(onReportDamage).toHaveBeenCalledWith(303);
    });
});
