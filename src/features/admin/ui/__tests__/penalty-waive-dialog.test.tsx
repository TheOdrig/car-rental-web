import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { ApiError } from '@/shared/api';
import { PenaltyWaiveDialog, createWaiverSchema } from '../penalty-waive-dialog';

const clientPost = vi.hoisted(() => vi.fn());

vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientPost };
});

const reason = 'Customer was delayed by a documented breakdown';

describe('createWaiverSchema', () => {
    const schema = createWaiverSchema(1000.25, 'TRY');

    it('accepts a partial waiver within the penalty', () => {
        expect(schema.safeParse({ fullWaiver: false, waiverAmount: 500, reason }).success).toBe(true);
    });

    it('rejects a waiver amount above the penalty with a message', () => {
        const result = schema.safeParse({ fullWaiver: false, waiverAmount: 5000, reason });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('The waiver cannot be more than the penalty of ₺1,000.25');
    });

    it('requires an amount unless the whole penalty is waived', () => {
        expect(schema.safeParse({ fullWaiver: false, reason }).success).toBe(false);
        expect(schema.safeParse({ fullWaiver: true, reason }).success).toBe(true);
    });

    it('requires a reason of at least ten characters', () => {
        expect(schema.safeParse({ fullWaiver: true, reason: 'short' }).success).toBe(false);
    });
});

describe('PenaltyWaiveDialog', () => {
    it('warns as soon as the waiver exceeds the penalty and blocks saving', () => {
        renderWithProviders(
            <PenaltyWaiveDialog open onOpenChange={vi.fn()} rentalId={4} originalPenalty={180} currency="USD" />
        );

        fireEvent.change(screen.getByLabelText('Waiver Amount'), { target: { value: '999' } });

        expect(screen.getByRole('alert')).toHaveTextContent('The waiver cannot be more than the penalty of $180.00');
        expect(screen.getByRole('button', { name: 'Waive Penalty' })).toBeDisabled();
        const field = screen.getByLabelText('Waiver Amount');
        expect(field).toHaveAttribute('aria-invalid', 'true');
        expect(field).toHaveAttribute('aria-describedby', 'waiverAmount-error');
    });

    it('shows the API waiver error on the amount field', async () => {
        clientPost.mockRejectedValueOnce(
            new ApiError({
                status: 400,
                message: 'Waiver amount exceeds the outstanding penalty',
                timestamp: new Date().toISOString(),
                code: 'PENALTY_WAIVER_ERROR',
                errors: [{ field: 'waiverAmount', message: 'Waiver amount exceeds the outstanding penalty of 40.00' }],
            })
        );
        renderWithProviders(
            <PenaltyWaiveDialog open onOpenChange={vi.fn()} rentalId={4} originalPenalty={180} currency="USD" />
        );

        fireEvent.change(screen.getByLabelText('Waiver Amount'), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: reason } });
        fireEvent.submit(screen.getByRole('button', { name: 'Waive Penalty' }).closest('form')!);

        await waitFor(() => expect(clientPost).toHaveBeenCalled());
        expect(await screen.findByTestId('waiver-amount-api-error')).toHaveTextContent(
            'Waiver amount exceeds the outstanding penalty of 40.00'
        );
    });
});
