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

    const run = useCallback(async (rentalId: number, action: () => Promise<unknown>) => {
        setActionInProgress(rentalId);
        try {
            await action();
        } catch {
            return;
        } finally {
            setActionInProgress(null);
        }
    }, []);

    return {
        actionInProgress,
        approve: (rentalId: number, notes?: string) =>
            run(rentalId, () => approveMutation.mutateAsync({ rentalId, notes })),
        reject: (rentalId: number, reason: string) =>
            run(rentalId, () => rejectMutation.mutateAsync({ rentalId, reason })),
        pickup: (rentalId: number, notes?: string) =>
            run(rentalId, () => pickupMutation.mutateAsync({ rentalId, notes })),
        processReturn: (rentalId: number, data?: string | ProcessReturnData) =>
            run(rentalId, () => returnMutation.mutateAsync({ rentalId, data })),
    };
}
