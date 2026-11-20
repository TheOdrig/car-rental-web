import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockDamage, createMockDamageListResponse } from '@/entities/damage/lib/testing/factories';
import { DamagesContent } from '../damages-content';

let search = '';
const mockUseDamages = vi.hoisted(() => vi.fn());
const mockUseCustomerDamages = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(search),
    useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/features/manage-damages', async () => {
    const actual = await vi.importActual<typeof import('@/features/manage-damages')>('@/features/manage-damages');
    return { ...actual, useDamages: mockUseDamages, useCustomerDamages: mockUseCustomerDamages };
});
vi.mock('@/features/admin', () => ({
    DamageTable: ({ damages }: { damages: unknown[] }) => <div data-testid="damage-table">{damages.length} damages</div>,
    DamageFilters: () => <div data-testid="damage-filters" />,
}));
vi.mock('@/shared/ui/breadcrumb', () => ({ Breadcrumb: () => null }));

const idle = { data: undefined, isLoading: false, isFetching: false, isError: false, refetch: vi.fn() };

describe('Admin DamagesContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        search = '';
        mockUseDamages.mockReturnValue({ ...idle, data: createMockDamageListResponse([createMockDamage()]) });
        mockUseCustomerDamages.mockReturnValue(idle);
    });

    it('passes the carId filter to the search endpoint', () => {
        search = 'carId=5&page=1';
        render(<DamagesContent />);

        expect(mockUseDamages).toHaveBeenCalledWith(expect.objectContaining({ carId: 5 }), 1, 20, true);
        expect(screen.getByText(/Showing damages for vehicle #5/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /show all damages/i })).toHaveAttribute('href', '/admin/damages');
    });

    it('uses the customer endpoint for a userId filter and disables the unfiltered search', () => {
        search = 'userId=9';
        mockUseCustomerDamages.mockReturnValue({
            ...idle,
            data: createMockDamageListResponse([createMockDamage(), createMockDamage({ id: 2 })]),
        });
        render(<DamagesContent />);

        expect(mockUseCustomerDamages).toHaveBeenCalledWith(9, 0, 20);
        expect(mockUseDamages).toHaveBeenCalledWith(expect.anything(), 0, 20, false);
        expect(screen.getByText(/Showing damages for customer #9/)).toBeInTheDocument();
        expect(screen.getByTestId('damage-table')).toHaveTextContent('2 damages');
        expect(screen.queryByTestId('damage-filters')).not.toBeInTheDocument();
    });

    it('forwards exact enum codes and drops labels or lower-case values', () => {
        search = 'severity=MAJOR&category=dent&status=Under%20Assessment';
        render(<DamagesContent />);

        expect(mockUseDamages).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'MAJOR', category: undefined, status: undefined }),
            0,
            20,
            true
        );
    });

    it('ignores malformed ids', () => {
        search = 'carId=abc&userId=-3';
        render(<DamagesContent />);

        expect(mockUseDamages).toHaveBeenCalledWith(expect.objectContaining({ carId: undefined }), 0, 20, true);
        expect(mockUseCustomerDamages).toHaveBeenCalledWith(undefined, 0, 20);
        expect(screen.queryByText(/Showing damages for/)).not.toBeInTheDocument();
    });

    it('shows an error with retry instead of an empty table when loading fails', async () => {
        const refetch = vi.fn();
        mockUseDamages.mockReturnValue({ ...idle, isError: true, refetch });
        render(<DamagesContent />);

        expect(screen.queryByTestId('damage-table')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
