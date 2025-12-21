'use client';

import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RentalStatus } from '@/types';

interface RentalTimelineProps {
    status: RentalStatus;
    className?: string;
}

interface TimelineStep {
    status: RentalStatus;
    label: string;
    description: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
    { status: 'Requested', label: 'Requested', description: 'Waiting for approval' },
    { status: 'Confirmed', label: 'Confirmed', description: 'Ready for pickup' },
    { status: 'In Use', label: 'In Use', description: 'Currently rented' },
    { status: 'Returned', label: 'Returned', description: 'Rental completed' },
];

const STATUS_ORDER: Record<RentalStatus, number> = {
    'Requested': 0,
    'Confirmed': 1,
    'In Use': 2,
    'Returned': 3,
    'Cancelled': -1,
};

function getStepIcon(step: TimelineStep, currentStatus: RentalStatus) {
    const stepOrder = STATUS_ORDER[step.status];
    const currentOrder = STATUS_ORDER[currentStatus];

    if (currentStatus === 'Cancelled') {
        if (step.status === 'Requested') {
            return <XCircle className="h-6 w-6 text-destructive" />;
        }
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }

    if (stepOrder < currentOrder) {
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    }

    if (stepOrder === currentOrder) {
        return <Clock className="h-6 w-6 text-primary animate-pulse" />;
    }

    return <Circle className="h-6 w-6 text-muted-foreground" />;
}

export function RentalTimeline({ status, className }: RentalTimelineProps) {
    if (status === 'Cancelled') {
        return (
            <div className={cn('space-y-4', className)}>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <XCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-destructive">Rental Cancelled</p>
                        <p className="text-sm text-muted-foreground">This rental has been cancelled.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('space-y-1', className)}>
            {TIMELINE_STEPS.map((step, index) => (
                <div key={step.status} className="relative">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                            {getStepIcon(step, status)}
                            {index < TIMELINE_STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        'w-0.5 h-8 my-1',
                                        STATUS_ORDER[step.status] < STATUS_ORDER[status]
                                            ? 'bg-green-500'
                                            : 'bg-muted'
                                    )}
                                />
                            )}
                        </div>
                        <div className="pt-0.5 pb-4">
                            <p
                                className={cn(
                                    'font-medium',
                                    STATUS_ORDER[step.status] <= STATUS_ORDER[status]
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
