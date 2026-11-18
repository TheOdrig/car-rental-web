'use client';

import { CheckCircle, XCircle, Car, CalendarCheck, Ban } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { AdminRentalStatus } from '@/entities/rental';
import type { LucideIcon } from 'lucide-react';

interface RentalActionButtonsProps {
    status: AdminRentalStatus;
    onApprove?: () => void;
    onReject?: () => void;
    onPickup?: () => void;
    onReturn?: () => void;
    onCancel?: () => void;
    pickupBlockedReason?: string;
    isLoading?: boolean;
}

interface ActionConfig {
    label: string;
    icon: LucideIcon;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
    action: 'approve' | 'reject' | 'pickup' | 'return' | 'cancel';
}

const statusActions: Record<AdminRentalStatus, ActionConfig[]> = {
    PENDING: [
        { label: 'Approve', icon: CheckCircle, variant: 'default', action: 'approve' },
        { label: 'Reject', icon: XCircle, variant: 'destructive', action: 'reject' },
    ],
    CONFIRMED: [
        { label: 'Process Pickup', icon: Car, variant: 'default', action: 'pickup' },
        { label: 'Cancel', icon: Ban, variant: 'destructive', action: 'cancel' },
    ],
    ACTIVE: [
        { label: 'Process Return', icon: CalendarCheck, variant: 'default', action: 'return' },
    ],
    COMPLETED: [],
    CANCELLED: [],
    REJECTED: [],
    OVERDUE: [
        { label: 'Process Return', icon: CalendarCheck, variant: 'default', action: 'return' },
    ],
};

export function RentalActionButtons({
    status,
    onApprove,
    onReject,
    onPickup,
    onReturn,
    onCancel,
    pickupBlockedReason,
    isLoading,
}: RentalActionButtonsProps) {
    const actions = statusActions[status] ?? [];

    if (actions.length === 0) {
        return null;
    }

    const handleAction = (action: ActionConfig['action']) => {
        switch (action) {
            case 'approve':
                onApprove?.();
                break;
            case 'reject':
                onReject?.();
                break;
            case 'pickup':
                onPickup?.();
                break;
            case 'return':
                onReturn?.();
                break;
            case 'cancel':
                onCancel?.();
                break;
        }
    };

    const showPickupHint = actions.some((action) => action.action === 'pickup');

    return (
        <div className="flex flex-wrap items-center gap-2">
            {actions.map((action) => {
                const Icon = action.icon;
                return (
                    <Button
                        key={action.action}
                        variant={action.variant}
                        onClick={() => handleAction(action.action)}
                        disabled={isLoading || (action.action === 'pickup' && !!pickupBlockedReason)}
                    >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                    </Button>
                );
            })}
            {showPickupHint && (
                <p className="basis-full text-xs text-muted-foreground" data-testid="pickup-payment-hint">
                    {pickupBlockedReason ?? 'Pickup captures the customer payment, which must be authorized first.'}
                </p>
            )}
        </div>
    );
}