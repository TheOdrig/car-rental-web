'use client';

import { StatusBadge } from '@/shared/ui/status-badge';
import { lateReturnStatusPresentation } from '../model/status-presentation';
import type { LateReturnStatus } from '../model/types';

interface LateReturnStatusBadgeProps {
    status?: LateReturnStatus | string | null;
    className?: string;
}

export function LateReturnStatusBadge({ status, className }: LateReturnStatusBadgeProps) {
    const { label, tone } = lateReturnStatusPresentation(status);
    return (
        <StatusBadge tone={tone} className={className}>
            {label}
        </StatusBadge>
    );
}
