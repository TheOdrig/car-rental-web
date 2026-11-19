import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/app/testing/test-utils';
import { createMockDamage } from '@/entities/damage/lib/testing/factories';
import { clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { DamageDetailContent } from '../damage-detail-content';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: vi.fn(), clientPost: vi.fn(), clientDelete: vi.fn() };
});
vi.mock('@/shared/lib', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/lib')>();
    return { ...original, showToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } };
});

const mockGet = vi.mocked(clientGet);
const mockPost = vi.mocked(clientPost);
const toast = vi.mocked(showToast);

function assessed(overrides = {}) {
    return createMockDamage({
        status: 'ASSESSED',
        repairCostEstimate: 500,
        customerLiability: 320.5,
        currency: 'TRY',
        ...overrides,
    });
}

describe('damage detail charge action', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('offers the charge for an assessed report with a positive liability and confirms amount and currency', async () => {
        mockGet.mockResolvedValue(assessed());
        mockPost.mockResolvedValueOnce({
            damageId: 1,
            status: 'CHARGED',
            charged: true,
            amount: 320.5,
            currency: 'TRY',
            transactionId: 'tx-1',
            message: 'Charged',
        });
        renderWithProviders(<DamageDetailContent id="1" />);

        await user.click(await screen.findByRole('button', { name: 'Charge customer' }));
        const dialog = await screen.findByRole('alertdialog');
        expect(within(dialog).getByText(/will be charged .*320\.50.*\(TRY\)/)).toBeInTheDocument();

        await user.click(within(dialog).getByRole('button', { name: /^Charge/ }));

        await waitFor(() => expect(mockPost).toHaveBeenCalledWith('/api/admin/damages/1/charge'));
        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Customer charged', 'Charged'));
    });

    it('shows the gateway message when the charge is declined', async () => {
        mockGet.mockResolvedValue(assessed());
        mockPost.mockResolvedValueOnce({
            damageId: 1,
            status: 'ASSESSED',
            charged: false,
            amount: 320.5,
            currency: 'TRY',
            transactionId: '',
            message: 'Card declined',
        });
        renderWithProviders(<DamageDetailContent id="1" />);

        await user.click(await screen.findByRole('button', { name: 'Charge customer' }));
        await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: /^Charge/ }));

        await waitFor(() => expect(toast.warning).toHaveBeenCalledWith('Charge was not completed', 'Card declined'));
        expect(toast.success).not.toHaveBeenCalled();
    });

    it('hides the charge for a report without liability', async () => {
        mockGet.mockResolvedValue(assessed({ customerLiability: 0 }));
        renderWithProviders(<DamageDetailContent id="1" />);

        await screen.findByText('Damage Report #1');
        expect(screen.queryByRole('button', { name: 'Charge customer' })).not.toBeInTheDocument();
    });

    it('hides the charge for a report that is not assessed', async () => {
        mockGet.mockResolvedValue(assessed({ status: 'CHARGED' }));
        renderWithProviders(<DamageDetailContent id="1" />);

        await screen.findByText('Damage Report #1');
        expect(screen.queryByRole('button', { name: 'Charge customer' })).not.toBeInTheDocument();
    });
});
