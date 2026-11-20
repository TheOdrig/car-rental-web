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

describe('damage detail assessment', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows the assessment notes and the insurance deductible', async () => {
        vi.mocked(clientGet).mockResolvedValue(
            createMockDamage({
                status: 'ASSESSED',
                repairCostEstimate: 500,
                customerLiability: 400,
                insuranceCoverage: true,
                insuranceDeductible: 100.25,
                assessmentNotes: 'Bumper needs a full respray',
                currency: 'EUR',
            })
        );

        renderWithProviders(<DamageDetailContent id="1" />);

        expect(await screen.findByTestId('damage-assessment-notes')).toHaveTextContent('Bumper needs a full respray');
        expect(screen.getByTestId('damage-deductible')).toHaveTextContent('€100.25');
    });
});
