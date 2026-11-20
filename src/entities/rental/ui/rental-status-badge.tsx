'use client';

import type { ComponentProps } from 'react';
import { StatusBadge } from '@/shared/ui/status-badge';
import { adminRentalStatusPresentation, pendingItemStatusPresentation, rentalStatusPresentation } from '../model/status-presentation';
import type { AdminRentalStatus } from '../model/types';

type RentalStatusBadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
    status: string | null | undefined;
};

interface AdminRentalStatusBadgeProps {
    status: AdminRentalStatus;
    className?: string;
}

export function RentalStatusBadge({ status, ...props }: RentalStatusBadgeProps) {
    const { label, tone } = rentalStatusPresentation(status);
    return (
        <StatusBadge tone={tone} {...props}>
            {label}
        </StatusBadge>
    );
}

export function PendingItemStatusBadge({ status, overdue = false }: { status: string | null | undefined; overdue?: boolean }) {
    const { label, tone } = pendingItemStatusPresentation(status, overdue);
    return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

export function AdminRentalStatusBadge({ status, className }: AdminRentalStatusBadgeProps) {
    const { label, tone } = adminRentalStatusPresentation(status);
    return (
        <StatusBadge tone={tone} className={className}>
            {label}
        </StatusBadge>
    );
}
