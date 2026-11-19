import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';

let query = '';
vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(query),
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/admin/rentals',
}));

const clientGet = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { AdminRentalsContent } from '../admin-rentals-content';

function pending(count: number, total: number) {
    return {
        content: Array.from({ length: count }, (_, index) => ({
            rentalId: index + 1,
            customerName: `Customer ${index + 1}`,
            customerEmail: `c${index + 1}@example.com`,
            carId: 1,
            carBrand: 'Fiat',
            carModel: 'Egea',
            licensePlate: '34ABC34',
            startDate: '2026-12-01',
            endDate: '2026-12-03',
            totalAmount: 100,
            status: 'Requested',
            createdAt: '2026-11-18T10:00:00',
        })),
        page: 0,
        size: 50,
        totalElements: total,
        totalPages: 1,
    };
}

function rentals() {
    return {
        content: [
            {
                id: 6,
                startDate: '2026-12-01',
                endDate: '2026-12-04',
                totalPrice: 172.33,
                currency: 'EUR',
                status: 'Returned',
                userSummary: { id: 31, username: 'qaadm1', email: 'qa@example.com' },
                carSummary: { id: 2, brand: 'Toyota', model: 'Yaris', licensePlate: '34QA22' },
            },
            {
                id: 7,
                startDate: '2026-12-10',
                endDate: '2026-12-12',
                totalPrice: 24525,
                currency: 'JPY',
                status: 'Cancelled',
                userSummary: { id: 31, username: 'qaadm1', email: 'qa@example.com' },
                carSummary: { id: 3, brand: 'Honda', model: 'Fit', licensePlate: '34QA23' },
            },
        ],
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
    };
}

describe('AdminRentalsContent', () => {
    beforeEach(() => {
        query = '';
        clientGet.mockReset();
        clientGet.mockImplementation((url: string) => {
            if (url.includes('/api/admin/dashboard/pending/approvals')) return Promise.resolve(pending(2, 23));
            if (url.includes('/api/admin/dashboard/pending')) return Promise.resolve(pending(0, 0));
            return Promise.resolve(rentals());
        });
        window.HTMLElement.prototype.hasPointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('asks for more than ten pending rows and says when the list is still truncated', async () => {
        renderWithProviders(<AdminRentalsContent />);

        expect(await screen.findByTestId('pending-truncated')).toHaveTextContent('Showing the first 2 of 23');
        expect(clientGet).toHaveBeenCalledWith(expect.stringContaining('/api/admin/dashboard/pending/approvals?size=50'));
    });

    it('lists every rental with its own currency in the All Rentals view', async () => {
        renderWithProviders(<AdminRentalsContent />);

        await userEvent.setup().click(await screen.findByRole('tab', { name: 'All Rentals' }));

        expect(await screen.findByText('CR-000006')).toBeInTheDocument();
        expect(screen.getByText('€172.33')).toBeInTheDocument();
        expect(screen.getByText('¥24,525')).toBeInTheDocument();
        expect(clientGet).toHaveBeenCalledWith(expect.stringContaining('/api/admin/rentals?page=0&size=20&sort=createTime%2Cdesc'));
    });

    it('applies the userId filter through the customer rentals endpoint', async () => {
        query = 'userId=31';
        renderWithProviders(<AdminRentalsContent />);

        expect(await screen.findByText('CR-000006')).toBeInTheDocument();
        await waitFor(() => expect(clientGet).toHaveBeenCalledWith(expect.stringContaining('/api/admin/users/31/rentals?page=0&size=20')));
        expect(screen.getByText('Rentals of customer #31')).toBeInTheDocument();
        expect(screen.queryByRole('tab', { name: 'Pending Work' })).not.toBeInTheDocument();
    });
});
