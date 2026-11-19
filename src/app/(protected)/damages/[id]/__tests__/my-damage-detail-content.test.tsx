import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';
import { MyDamageDetailContent } from '../my-damage-detail-content';

const mockUseMyDamageDetail = vi.hoisted(() => vi.fn());
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ back: mockBack, push: vi.fn() }),
}));
vi.mock('@/entities/damage', async () => {
    const actual = await vi.importActual<typeof import('@/entities/damage')>('@/entities/damage');
    return { ...actual, useMyDamageDetail: mockUseMyDamageDetail };
});
vi.mock('@/features/manage-damages', () => ({
    DamageDisputeForm: ({ open }: { open: boolean }) => (open ? <div role="dialog">Dispute dialog</div> : null),
}));

describe('MyDamageDetailContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the report from the customer data and parses the id from the route', () => {
        mockUseMyDamageDetail.mockReturnValue({
            data: createMockDamage({ id: 12, status: 'ASSESSED', description: 'Cracked windshield' }),
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<MyDamageDetailContent id="12" />);

        expect(mockUseMyDamageDetail).toHaveBeenCalledWith(12);
        expect(screen.getByText('Cracked windshield')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /dispute charge/i })).not.toBeInTheDocument();
    });

    it('lets the customer open the dispute for a charged damage', async () => {
        mockUseMyDamageDetail.mockReturnValue({
            data: createMockDamage({ id: 12, status: 'CHARGED' }),
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<MyDamageDetailContent id="12" />);
        await userEvent.click(screen.getByRole('button', { name: /dispute charge/i }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows not found only when the list does not contain the damage', () => {
        mockUseMyDamageDetail.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() });

        render(<MyDamageDetailContent id="12" />);

        expect(screen.getByText('Damage report not found')).toBeInTheDocument();
    });

    it('shows an error with retry instead of not found when loading fails', async () => {
        const refetch = vi.fn();
        mockUseMyDamageDetail.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });

        render(<MyDamageDetailContent id="12" />);

        expect(screen.queryByText('Damage report not found')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('does not query for a non numeric id', () => {
        mockUseMyDamageDetail.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });

        render(<MyDamageDetailContent id="abc" />);

        expect(mockUseMyDamageDetail).toHaveBeenCalledWith(null);
    });
});
