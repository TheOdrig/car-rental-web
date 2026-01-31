'use client';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib';
import { getDamageSeverityColor, getDamageSeverityLabel, type DamageSeverity } from '@/entities/damage';

interface DamageSeverityBadgeProps {
    severity: DamageSeverity;
    className?: string;
}

export function DamageSeverityBadge({ severity, className }: DamageSeverityBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(getDamageSeverityColor(severity), 'border-0', className)}
        >
            {getDamageSeverityLabel(severity)}
        </Badge>
    );
}