'use client';

import { StatusBadge } from '@/shared/ui/status-badge';
import { carServiceStatusPresentation, carStatusPresentation } from '../model/status-presentation';

interface CarStatusBadgeProps {
    status: string | null | undefined;
    audience?: 'public' | 'service';
    className?: string;
}

export function CarStatusBadge({ status, audience = 'service', className }: CarStatusBadgeProps) {
    const { label, tone } = (audience === 'public' ? carStatusPresentation : carServiceStatusPresentation)(status);
    return (
        <StatusBadge tone={tone} className={className}>
            {label}
        </StatusBadge>
    );
}
