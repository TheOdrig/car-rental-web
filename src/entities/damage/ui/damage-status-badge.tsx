'use client';

import { StatusBadge } from '@/shared/ui/status-badge';
import { damageStatusPresentation } from '../model/status-presentation';
import type { DamageStatus } from '../model/types';

interface DamageStatusBadgeProps {
    status: DamageStatus;
    className?: string;
}

export function DamageStatusBadge({ status, className }: DamageStatusBadgeProps) {
    const { label, tone } = damageStatusPresentation(status);
    return (
        <StatusBadge tone={tone} className={className}>
            {label}
        </StatusBadge>
    );
}
