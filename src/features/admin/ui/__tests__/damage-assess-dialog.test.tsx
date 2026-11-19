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

    it('uses the rental currency even when the report still carries USD', () => {
        renderWithProviders(
            <DamageAssessDialog damageId={3} open onOpenChange={vi.fn()} rentalCurrency="EUR" defaultValues={{ currency: 'USD' }} />
        );

        expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('EUR');
    });

    it('falls back to the currency stored on the report while the rental is unknown', () => {
        renderWithProviders(<DamageAssessDialog damageId={3} open onOpenChange={vi.fn()} defaultValues={{ currency: 'JPY' }} />);

        expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('JPY');
    });

    it('follows the rental currency when the rental loads after the dialog opened', () => {
        const view = renderWithProviders(<DamageAssessDialog damageId={3} open onOpenChange={vi.fn()} />);
        expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('USD');

        view.rerender(<DamageAssessDialog damageId={3} open onOpenChange={vi.fn()} rentalCurrency="EUR" />);

        expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('EUR');
    });

    it('prefills the existing cost, insurance flag, deductible and notes when re-assessing', async () => {
        clientPut.mockResolvedValue({ id: 3 });
        renderWithProviders(
            <DamageAssessDialog
                damageId={3}
                open
                onOpenChange={vi.fn()}
                mode="reassess"
                rentalCurrency="EUR"
                defaultValues={{
                    repairCostEstimate: 250.75,
                    insuranceCoverage: true,
                    insuranceDeductible: 100.25,
                    assessmentNotes: 'Bumper replaced',
                }}
            />
        );

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByLabelText(/Repair Cost Estimate/)).toHaveValue(250.75);
        expect(within(dialog).getByLabelText(/Covered by insurance/)).toBeChecked();
        expect(within(dialog).getByLabelText(/Insurance Deductible/)).toHaveValue(100.25);
        expect(within(dialog).getByLabelText('Assessment Notes')).toHaveValue('Bumper replaced');

        fireEvent.submit(within(dialog).getByRole('button', { name: 'Save Assessment' }).closest('form')!);

        await waitFor(() =>
            expect(clientPut).toHaveBeenCalledWith(
                '/api/admin/damages/3/assess',
                expect.objectContaining({
                    repairCostEstimate: 250.75,
                    insuranceCoverage: true,
                    insuranceDeductible: 100.25,
                    assessmentNotes: 'Bumper replaced',
                    currency: 'EUR',
                })
            )
        );
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
