'use client';

import type { ReactNode } from 'react';
import { StatusBadge } from '@/shared/ui/status-badge';
import { accountStatusPresentation } from '../model/status-presentation';

interface AccountStatusBadgeProps {
    status: string | null | undefined;
    className?: string;
    icon?: ReactNode;
}

export function AccountStatusBadge({ status, className, icon }: AccountStatusBadgeProps) {
    const { label, tone } = accountStatusPresentation(status);
    return (
        <StatusBadge tone={tone} className={className}>
            {icon}
            {label}
        </StatusBadge>
    );
}
