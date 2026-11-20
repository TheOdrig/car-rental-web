'use client';

import { Car, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { PendingItem } from '@/entities/rental';
import type { PendingRentalsType } from './format';

export type PendingAction = 'approve' | 'pickup' | 'return' | 'reject';

interface PendingRentalActionProps {
    item: PendingItem;
    type: PendingRentalsType;
    isProcessing: boolean;
    onAction: (item: PendingItem, action: PendingAction) => void;
}

export function PendingRentalAction({ item, type, isProcessing, onAction }: PendingRentalActionProps) {
    switch (type) {
        case 'approvals':
            return (
                <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:justify-end max-xl:sm:justify-start">
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onAction(item, 'reject')}
                        disabled={isProcessing}
                        className="gap-1"
                        aria-label={`Reject rental request for ${item.customerName}`}
                    >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Reject
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onAction(item, 'approve')}
                        disabled={isProcessing}
                        className="gap-1"
                        aria-label={`Approve rental request for ${item.customerName}`}
                    >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        {isProcessing ? 'Approving...' : 'Approve'}
                    </Button>
                </div>
            );
        case 'pickups':
            return (
                <Button
                    size="sm"
                    onClick={() => onAction(item, 'pickup')}
                    disabled={isProcessing}
                    className="gap-1 cursor-pointer"
                    aria-label={`Process pickup for ${item.customerName}`}
                >
                    <Car className="h-4 w-4" aria-hidden="true" />
                    {isProcessing ? 'Processing...' : 'Pickup'}
                </Button>
            );
        case 'returns':
        case 'overdue':
            return (
                <Button
                    size="sm"
                    variant={type === 'overdue' ? 'destructive' : 'default'}
                    onClick={() => onAction(item, 'return')}
                    disabled={isProcessing}
                    className="gap-1"
                    aria-label={`Process return for ${item.customerName}`}
                >
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    {isProcessing ? 'Processing...' : 'Return'}
                </Button>
            );
        default:
            return null;
    }
}
