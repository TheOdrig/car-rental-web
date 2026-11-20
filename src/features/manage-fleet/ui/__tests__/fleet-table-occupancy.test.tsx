import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FleetTable } from '../fleet-table';

function car(id: number, extra: Record<string, unknown>) {
    return {
        id,
        brand: 'Honda',
        model: `Civic ${id}`,
        productionYear: 2022,
        licensePlate: `AB ${id}`,
        carStatusType: 'AVAILABLE',
        price: 100,
        currencyType: 'USD',
        ...extra,
    } as never;
}

describe('FleetTable occupancy', () => {
    it('shows a link to the current rental for reserved and in-use cars and plain text for free ones', () => {
        render(
            <FleetTable
                cars={[
                    car(1, { occupancy: 'IN_USE', currentRentalId: 9 }),
                    car(2, { occupancy: 'RESERVED', currentRentalId: 12 }),
                    car(3, { occupancy: 'FREE' }),
                    car(4, {}),
                ]}
                totalCars={4}
                onDeleteCar={vi.fn()}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.getByRole('link', { name: /In use, rental CR-000009/ })).toHaveAttribute('href', '/admin/rentals/9');
        expect(screen.getByRole('link', { name: /Reserved today, rental CR-000012/ })).toHaveAttribute('href', '/admin/rentals/12');
        expect(screen.getAllByText('Free')).toHaveLength(2);
        expect(screen.getByRole('columnheader', { name: 'Occupancy' })).toBeInTheDocument();
    });
});
