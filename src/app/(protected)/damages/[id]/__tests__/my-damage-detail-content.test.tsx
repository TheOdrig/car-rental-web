import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';
import { MyDamageDetailContent } from '../my-damage-detail-content';

const mockUseCar = vi.hoisted(() => vi.fn(() => ({ data: undefined as { car: { brand: string; model: string } } | undefined })));

vi.mock('@/entities/car/api/use-cars', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/entities/car/api/use-cars')>()),
    useCar: mockUseCar,
}));

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

    it('shows the customer how a resolved dispute ended', () => {
        mockUseMyDamageDetail.mockReturnValue({
            data: createMockDamage({
                id: 12,
                status: 'RESOLVED',
                currency: 'EUR',
                repairCostEstimate: 300,
                customerLiability: 80,
                originalLiability: 180.4,
                refundAmount: 100.4,
                disputeReason: 'It was already there at pickup',
                disputedAt: '2030-01-02T10:00:00Z',
                resolutionNotes: 'Partly accepted after photo review',
                resolvedAt: '2030-01-03T10:00:00Z',
            }),
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<MyDamageDetailContent id="12" />);

        const outcome = screen.getByTestId('dispute-outcome');
        expect(outcome).toHaveTextContent('How your dispute ended');
        expect(outcome).toHaveTextContent('Original liability€180.40');
        expect(outcome).toHaveTextContent('Final liability€80.00');
        expect(outcome).toHaveTextContent('Refunded to you€100.40');
        expect(outcome).toHaveTextContent('Partly accepted after photo review');
        expect(outcome).toHaveTextContent('It was already there at pickup');
    });

    it('shows an open dispute without a final liability', () => {
        mockUseMyDamageDetail.mockReturnValue({
            data: createMockDamage({ id: 12, status: 'DISPUTED', currency: 'EUR', customerLiability: 180.4, originalLiability: 180.4, disputedAt: '2030-01-02T10:00:00Z' }),
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<MyDamageDetailContent id="12" />);

        const outcome = screen.getByTestId('dispute-outcome');
        expect(outcome).toHaveTextContent('Your dispute');
        expect(outcome).not.toHaveTextContent('Final liability');
    });

    it('has no dispute card for an undisputed damage', () => {
        mockUseMyDamageDetail.mockReturnValue({ data: createMockDamage({ id: 12, status: 'CHARGED' }), isLoading: false, isError: false, refetch: vi.fn() });

        render(<MyDamageDetailContent id="12" />);

        expect(screen.queryByTestId('dispute-outcome')).not.toBeInTheDocument();
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

    it('shows the reference, the breadcrumb and the photos through the file proxy', () => {
        mockUseMyDamageDetail.mockReturnValue({
            data: createMockDamage({
                id: 12,
                rentalId: 16,
                photos: [{ id: 1, fileName: 'dent.png', secureUrl: '/api/v1/files/damage-photos/dent.png', fileSize: 10, uploadedAt: '2026-11-19T10:00:00Z' }],
            }),
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<MyDamageDetailContent id="12" />);

        expect(screen.getByRole('link', { name: 'CR-000016' })).toHaveAttribute('href', '/rentals/16');
        expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('My Damages');
        expect(screen.getByAltText('dent.png')).toHaveAttribute('src', '/api/files/damage-photos/dent.png');
    });
});
