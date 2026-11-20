'use client';

import { StatusBadge } from '@/shared/ui/status-badge';
import { damageSeverityPresentation } from '../model/status-presentation';
import type { DamageSeverity } from '../model/types';

interface DamageSeverityBadgeProps {
    severity?: DamageSeverity | null;
    className?: string;
}

export function DamageSeverityBadge({ severity, className }: DamageSeverityBadgeProps) {
    const { label, tone } = damageSeverityPresentation(severity);
    return (
        <StatusBadge tone={tone} className={className}>
            {label}
        </StatusBadge>
    );
}
