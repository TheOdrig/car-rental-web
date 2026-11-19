import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { QuickActionsCard } from '@/features/admin';
import type { PendingItem } from '@/features/admin';
import { renderWithProviders } from '@/app/testing/test-utils';

function pendingItem(rentalId: number, startDate: string): PendingItem {
    return {
        rentalId,
        customerName: 'Ada Lovelace',
        customerEmail: 'ada@example.com',
        carId: 1,
        carBrand: 'Fiat',
        carModel: 'Egea',
        licensePlate: '35 ABC 123',
        startDate,
        endDate: '2099-01-10',
        totalAmount: 100,
        status: 'CONFIRMED',
        createdAt: '2026-01-01T00:00:00Z',
    } as PendingItem;
}

describe('QuickActionsCard pickup before start date', () => {
    it('disables the pickup action when every pending pickup starts in the future', () => {
        renderWithProviders(
            <QuickActionsCard pickupItems={[pendingItem(1, '2099-01-05')]} actionInProgress={null} onPickup={vi.fn()} />
        );

        expect(screen.getByRole('button', { name: /pending pickups/i })).toBeDisabled();
    });

    it('keeps the pickup action enabled when a pickup is due', () => {
        renderWithProviders(
            <QuickActionsCard
                pickupItems={[pendingItem(1, '2099-01-05'), pendingItem(2, '2020-01-05')]}
                actionInProgress={null}
                onPickup={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /pending pickups/i })).toBeEnabled();
    });
});
