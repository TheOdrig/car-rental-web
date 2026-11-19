import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api';
import {
    EarlyReturnPreviewPanel,
    NOT_IN_USE_MESSAGE,
    NO_PAYMENT_MESSAGE,
    PREVIEW_FAILED_MESSAGE,
} from '../early-return-preview-panel';

type Query = Parameters<typeof EarlyReturnPreviewPanel>[0]['query'];

function query(overrides: Partial<Query>): Query {
    return { data: undefined, isLoading: false, isError: false, error: null, refetch: vi.fn(), ...overrides } as Query;
}

function problem(status: number, code?: string): ApiError {
    return new ApiError({ status, message: 'failed', timestamp: new Date().toISOString(), code });
}

describe('EarlyReturnPreviewPanel', () => {
    it('shows a loading state and no numbers while the preview loads', () => {
        render(<EarlyReturnPreviewPanel query={query({ isLoading: true })} />);

        expect(screen.getByTestId('early-return-preview-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('early-return-preview')).not.toBeInTheDocument();
    });

    it('formats the refund with the rental currency and shows the unused days', () => {
        render(
            <EarlyReturnPreviewPanel
                query={query({ data: { rentalId: 7, amount: 1234.5, currency: 'EUR', unusedDays: 3 } })}
            />
        );

        expect(screen.getByText('€1,234.50')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it.each([
        [problem(400, 'INVALID_RENTAL_STATE'), NOT_IN_USE_MESSAGE],
        [problem(404), NO_PAYMENT_MESSAGE],
        [problem(503), PREVIEW_FAILED_MESSAGE],
        [new Error('network'), PREVIEW_FAILED_MESSAGE],
    ])('explains the failure without inventing numbers', (error, message) => {
        render(<EarlyReturnPreviewPanel query={query({ isError: true, error })} />);

        expect(screen.getByRole('alert')).toHaveTextContent(message);
        expect(screen.queryByTestId('early-return-preview')).not.toBeInTheDocument();
        expect(screen.queryByText(/€|\$/)).not.toBeInTheDocument();
    });

    it('offers a retry after a failure', async () => {
        const refetch = vi.fn();
        render(<EarlyReturnPreviewPanel query={query({ isError: true, error: problem(503), refetch })} />);

        await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));

        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
