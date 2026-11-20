import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/admin/fleet',
}));

const clientGet = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { FleetManagementContent } from '../fleet-management-content';

function car(id: number, brand: string, status: string) {
    return {
        id,
        brand,
        model: `Model ${id}`,
        licensePlate: `34ABC${id}`,
        productionYear: 2022,
        price: 100,
        currencyType: 'USD',
        carStatusType: status,
    };
}

function page(content: unknown[], overrides: Record<string, unknown> = {}) {
    return { content, page: 0, size: 25, totalElements: content.length, totalPages: 1, ...overrides };
}

const fleetStatus = {
    totalCars: 2,
    availableCars: 1,
    rentedCars: 0,
    reservedCars: 0,
    maintenanceCars: 1,
    inspectionCars: 0,
    damagedCars: 0,
    occupancyRate: 0,
    generatedAt: '2026-11-19T10:00:00Z',
};

function carsUrls(): string[] {
    return clientGet.mock.calls.map(([url]) => String(url)).filter((url) => url.startsWith('/api/admin/cars'));
}

describe('FleetManagementContent', () => {
    beforeEach(() => {
        clientGet.mockReset();
        clientGet.mockImplementation((url: string) => {
            if (url.startsWith('/api/admin/fleet')) return Promise.resolve(fleetStatus);
            return Promise.resolve(page([car(1, 'Fiat', 'AVAILABLE'), car(2, 'Toyota', 'MAINTENANCE')], { totalPages: 3, totalElements: 60 }));
        });
        window.HTMLElement.prototype.hasPointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('asks the admin endpoint for a page of 25 and shows the status labels', async () => {
        renderWithProviders(<FleetManagementContent />);

        expect(await screen.findByText('Fiat Model 1')).toBeInTheDocument();
        expect(carsUrls()[0]).toBe('/api/admin/cars?page=0&size=25');
        expect(screen.getByText('Maintenance', { selector: 'div' })).toBeInTheDocument();
        expect(screen.getByText('Showing 2 of 60 vehicles', { selector: 'p' })).toBeInTheDocument();
    });

    it('sends the status code and the search text to the server instead of filtering the page', async () => {
        const user = userEvent.setup();
        renderWithProviders(<FleetManagementContent />);
        await screen.findByText('Fiat Model 1');

        await user.type(screen.getByRole('textbox', { name: 'Search cars' }), 'egea');
        await waitFor(() => expect(carsUrls()).toContain('/api/admin/cars?search=egea&page=0&size=25'));

        await user.click(screen.getByRole('combobox', { name: 'Filter by status' }));
        await user.click(await screen.findByRole('option', { name: 'Maintenance' }));
        await waitFor(() => expect(carsUrls()).toContain('/api/admin/cars?status=MAINTENANCE&search=egea&page=0&size=25'));
        expect(screen.getByText('Fiat Model 1')).toBeInTheDocument();
    });

    it('requests the next page from the server', async () => {
        const user = userEvent.setup();
        renderWithProviders(<FleetManagementContent />);
        await screen.findByText('Fiat Model 1');

        await user.click(screen.getByRole('button', { name: 'Next page' }));

        await waitFor(() => expect(carsUrls()).toContain('/api/admin/cars?page=1&size=25'));
    });
});
