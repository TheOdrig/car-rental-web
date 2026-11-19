import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { DamageAssessDialog } from '../damage-assess-dialog';

const clientPost = vi.fn();
const clientPut = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return {
        ...original,
        clientPost: (...args: unknown[]) => clientPost(...args),
        clientPut: (...args: unknown[]) => clientPut(...args),
    };
});

describe('DamageAssessDialog', () => {
    beforeEach(() => {
        clientPost.mockReset();
        clientPut.mockReset();
        window.HTMLElement.prototype.hasPointerCapture = vi.fn();
        window.HTMLElement.prototype.setPointerCapture = vi.fn();
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('defaults the currency to the rental currency, not USD', () => {
        renderWithProviders(<DamageAssessDialog damageId={3} open onOpenChange={vi.fn()} rentalCurrency="GBP" defaultValues={{ insuranceCoverage: true }} />);

        expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('GBP');
        expect(screen.getByText(/Insurance Deductible \(£\)/)).toBeInTheDocument();
    });

    it('prefers the currency already stored on the report', () => {
        renderWithProviders(
            <DamageAssessDialog damageId={3} open onOpenChange={vi.fn()} rentalCurrency="GBP" defaultValues={{ currency: 'JPY' }} />
        );

        expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('JPY');
    });

    it('updates an existing assessment through PUT when re-assessing', async () => {
        clientPut.mockResolvedValue({ id: 3 });
        renderWithProviders(
            <DamageAssessDialog
                damageId={3}
                open
                onOpenChange={vi.fn()}
                mode="reassess"
                rentalCurrency="GBP"
                defaultValues={{ repairCostEstimate: 250, currency: 'GBP' }}
            />
        );

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Update Assessment', { selector: 'h2' })).toBeInTheDocument();
        fireEvent.submit(within(dialog).getByRole('button', { name: 'Save Assessment' }).closest('form')!);

        await waitFor(() => expect(clientPut).toHaveBeenCalledWith('/api/admin/damages/3/assess', expect.objectContaining({ currency: 'GBP' })));
        expect(clientPost).not.toHaveBeenCalled();
    });
});
