'use client';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib';
import { getDamageStatusColor, getDamageStatusLabel, type DamageStatus } from '@/entities/damage';

interface DamageStatusBadgeProps {
    status: DamageStatus;
    className?: string;
}

export function DamageStatusBadge({ status, className }: DamageStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(getDamageStatusColor(status), 'border-0', className)}
        >
            {getDamageStatusLabel(status)}
        </Badge>
    );
}
