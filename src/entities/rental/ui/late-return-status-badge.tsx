'use client';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib';
import { getLateReturnStatusColor, getLateReturnStatusLabel } from '../lib/utils';
import type { LateReturnStatus } from '../model/types';

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
