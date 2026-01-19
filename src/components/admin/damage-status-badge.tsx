'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDamageStatusColor, getDamageStatusLabel, type DamageStatus } from '@/types';

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
