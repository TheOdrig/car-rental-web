import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FleetStatsCards } from '../fleet-stats';
import type { FleetStatus } from '@/entities/car';

describe('FleetStatsCards', () => {
    it('shows full status labels instead of abbreviations', () => {
        const data = { totalCars: 5, availableCars: 3, rentedCars: 1, reservedCars: 0, maintenanceCars: 1, inspectionCars: 0, damagedCars: 0 } as FleetStatus;
        render(<FleetStatsCards data={data} />);

        for (const label of ['Total', 'Available', 'Rented', 'Reserved', 'Maintenance', 'Inspection', 'Damaged']) {
            expect(screen.getByText(label)).toBeInTheDocument();
        }
        expect(screen.queryByText(/maint\.|inspect$/i)).not.toBeInTheDocument();
    });
});
