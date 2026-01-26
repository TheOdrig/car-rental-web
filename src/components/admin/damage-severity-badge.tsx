'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDamageSeverityColor, getDamageSeverityLabel, type DamageSeverity } from '@/types';

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

