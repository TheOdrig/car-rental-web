'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getLateReturnStatusColor, getLateReturnStatusLabel, type LateReturnStatus } from '@/types';

interface LateReturnStatusBadgeProps {
    status: LateReturnStatus;
    className?: string;
}

export function LateReturnStatusBadge({ status, className }: LateReturnStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(getLateReturnStatusColor(status), 'border-0', className)}
        >
            {getLateReturnStatusLabel(status)}
        </Badge>
    );
}
