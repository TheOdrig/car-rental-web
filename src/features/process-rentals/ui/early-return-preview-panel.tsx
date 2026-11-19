'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { isApiError } from '@/shared/api';
import { formatCurrency } from '@/shared/lib';
import { Button } from '@/shared/ui/button';
import type { EarlyReturnPreview } from '../model/types';

interface EarlyReturnPreviewPanelProps {
    query: Pick<UseQueryResult<EarlyReturnPreview>, 'data' | 'isLoading' | 'isError' | 'error' | 'refetch'>;
}

export const NOT_IN_USE_MESSAGE = 'This rental is no longer in use, so it cannot be returned early.';
export const NO_PAYMENT_MESSAGE = 'No payment was found for this rental, so no refund can be calculated.';
export const PREVIEW_FAILED_MESSAGE = 'The refund amount could not be calculated.';

function errorMessage(error: unknown): string {
    if (isApiError(error)) {
        if (error.status === 400 && error.code === 'INVALID_RENTAL_STATE') return NOT_IN_USE_MESSAGE;
        if (error.status === 404) return NO_PAYMENT_MESSAGE;
    }
    return PREVIEW_FAILED_MESSAGE;
}

export function EarlyReturnPreviewPanel({ query }: EarlyReturnPreviewPanelProps) {
    if (query.isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" data-testid="early-return-preview-loading">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Calculating the refund...
            </div>
        );
    }

    if (query.isError || !query.data) {
        return (
            <div className="flex flex-col gap-2 text-sm" role="alert" data-testid="early-return-preview-error">
                <p className="text-destructive">{errorMessage(query.error)}</p>
                <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => void query.refetch()}>
                    Try again
                </Button>
            </div>
        );
    }

    const { amount, currency, unusedDays } = query.data;

    return (
        <dl className="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-3 text-sm" data-testid="early-return-preview">
            <dt className="text-muted-foreground">Refund to the customer</dt>
            <dd className="text-right font-semibold">{formatCurrency(amount, currency)}</dd>
            <dt className="text-muted-foreground">Unused days</dt>
            <dd className="text-right font-semibold">{unusedDays}</dd>
        </dl>
    );
}
