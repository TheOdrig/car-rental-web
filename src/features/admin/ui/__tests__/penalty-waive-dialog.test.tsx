import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { PenaltyWaiveDialog, createWaiverSchema } from '../penalty-waive-dialog';

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
    });
});
