'use client';

import { useCallback, useState } from 'react';
import { useApproveRental, useProcessPickup, useProcessReturn, useRejectRental } from '../api/process-api';
import type { ProcessReturnData } from '../model/types';

export function useRentalActions() {
    const [actionInProgress, setActionInProgress] = useState<number | null>(null);

    const approveMutation = useApproveRental();
    const rejectMutation = useRejectRental();
    const pickupMutation = useProcessPickup();
    const returnMutation = useProcessReturn();

    const run = useCallback(async (rentalId: number, label: string, action: () => Promise<unknown>) => {
        setActionInProgress(rentalId);
        try {
            await action();
        } catch (error) {
            console.error(`Failed to ${label}:`, error);
        } finally {
            setActionInProgress(null);
        }
    }, []);

    return {
        actionInProgress,
        approve: (rentalId: number, notes?: string) =>
            run(rentalId, 'approve rental', () => approveMutation.mutateAsync({ rentalId, notes })),
        reject: (rentalId: number, reason: string) =>
            run(rentalId, 'reject rental', () => rejectMutation.mutateAsync({ rentalId, reason })),
        pickup: (rentalId: number, notes?: string) =>
            run(rentalId, 'process pickup', () => pickupMutation.mutateAsync({ rentalId, notes })),
        processReturn: (rentalId: number, data?: string | ProcessReturnData) =>
            run(rentalId, 'process return', () => returnMutation.mutateAsync({ rentalId, data })),
    };
}
