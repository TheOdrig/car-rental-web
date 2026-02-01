'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/ui';
import type { Rental } from '@/entities/rental';
import { performRentalAction, cancelRental } from '@/features/manage-rentals';
import { rentalActions } from '@/features/manage-rentals';
import { publishRentalApproved, publishRentalRejected, publishRentalCancelled } from '@/features/manage-rentals';

interface RentalActionsProps {
    rental: Rental;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function RentalActions({ rental, onSuccess, onError }: RentalActionsProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: 'approve' | 'reject' | 'pickup' | 'return' | 'cancel') => {
        setIsLoading(true);
        try {
            const updatedRental = await performRentalAction({
                rentalId: rental.id,
                action,
            });

            rentalActions.updateRental(updatedRental);

            if (action === 'approve') {
                publishRentalApproved(updatedRental);
            } else if (action === 'reject') {
                publishRentalRejected(updatedRental);
            } else if (action === 'cancel') {
                publishRentalCancelled(updatedRental.id);
            }

            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : `Failed to ${action} rental`;
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        setIsLoading(true);
        try {
            const updatedRental = await cancelRental(rental.id);
            rentalActions.updateRental(updatedRental);
            publishRentalCancelled(updatedRental.id);
            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to cancel rental';
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            {rental.status === 'Requested' && (
                <>
                    <Button
                        onClick={() => handleAction('approve')}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Approve
                    </Button>
                    <Button
                        onClick={() => handleAction('reject')}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Reject
                    </Button>
                </>
            )}

            {rental.status === 'Confirmed' && (
                <Button
                    onClick={() => handleAction('pickup')}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Mark as Picked Up
                </Button>
            )}

            {rental.status === 'In Use' && (
                <Button
                    onClick={() => handleAction('return')}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    Mark as Returned
                </Button>
            )}

            {(rental.status === 'Requested' || rental.status === 'Confirmed') && (
                <Button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-700"
                >
                    Cancel
                </Button>
            )}
        </div>
    );
}