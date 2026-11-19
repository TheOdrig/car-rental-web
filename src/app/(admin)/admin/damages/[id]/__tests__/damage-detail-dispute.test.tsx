import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';
import { clientGet } from '@/shared/api';
import { DamageDetailContent } from '../damage-detail-content';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: vi.fn(), clientPost: vi.fn(), clientDelete: vi.fn() };
});

const mockGet = vi.mocked(clientGet);

describe('damage detail dispute card', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows the reason, comments, amounts and resolution of a resolved dispute', async () => {
        mockGet.mockResolvedValue(
            createMockDamage({
                status: 'RESOLVED',
                currency: 'USD',
                repairCostEstimate: 500,
                customerLiability: 200,
                originalLiability: 400,
                refundAmount: 200,
                disputeReason: 'Damage was already there at pickup',
                disputeComments: 'Photos from the handover attached',
                disputedAt: '2026-11-18T10:00:00Z',
                resolutionNotes: 'Liability halved after review',
                resolvedAt: '2026-11-19T09:00:00Z',
            })
        );

        renderWithProviders(<DamageDetailContent id="1" />);

        expect(await screen.findByText('Dispute')).toBeInTheDocument();
        expect(screen.getByText('Damage was already there at pickup')).toBeInTheDocument();
        expect(screen.getByText('Photos from the handover attached')).toBeInTheDocument();
        expect(screen.getByText('Liability halved after review')).toBeInTheDocument();
        expect(screen.getByText('$400.00')).toBeInTheDocument();
        expect(screen.getByText('$200.00', { selector: 'p.font-medium' })).toBeInTheDocument();
    });

    it('hides the dispute card for a report that was never disputed', async () => {
        mockGet.mockResolvedValue(createMockDamage({ status: 'REPORTED' }));

        renderWithProviders(<DamageDetailContent id="1" />);

        await screen.findByText('Damage Information');
        expect(screen.queryByText('Dispute')).not.toBeInTheDocument();
    });
});
