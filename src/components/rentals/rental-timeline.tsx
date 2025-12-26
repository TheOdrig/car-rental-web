'use client';

import { memo, type ReactNode } from 'react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    Circle,
    Calendar,
    MapPin,
    Car,
    CheckSquare,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { RentalStatus } from '@/types';

interface RentalTimelineProps {
    status: RentalStatus;
    startDate?: string;
    endDate?: string;
    pickupLocation?: string;
    className?: string;
}

interface TimelineStep {
    id: number;
    label: string;
    description: string;
    icon: ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
    {
        id: 1,
        label: 'Booking Confirmed',
        description: 'Your reservation is confirmed',
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        id: 2,
        label: 'Pick-up Scheduled',
        description: 'Ready for vehicle pickup',
        icon: <MapPin className="h-4 w-4" />,
    },
    {
        id: 3,
        label: 'Rental Active',
        description: 'Enjoy your trip!',
        icon: <Car className="h-4 w-4" />,
    },
    {
        id: 4,
        label: 'Return & Complete',
        description: 'Rental completed successfully',
        icon: <CheckSquare className="h-4 w-4" />,
    },
];

function getStepFromStatus(status: RentalStatus): number {
    switch (status) {
        case 'Requested':
            return 0;
        case 'Confirmed':
            return 1;
        case 'In Use':
            return 3;
        case 'Returned':
            return 4;
        case 'Cancelled':
            return -1;
        default:
            return 0;
    }
}

interface StepIndicatorProps {
    step: TimelineStep;
    currentStep: number;
    isLast: boolean;
}

function StepIndicator({ step, currentStep, isLast }: StepIndicatorProps) {
    const isCompleted = step.id < currentStep;
    const isCurrent = step.id === currentStep;
    const isPending = step.id > currentStep;

    return (
        <div className="relative flex flex-col items-center">
            <div
                className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-green-500 bg-green-500 text-white',
                    isCurrent && 'border-primary bg-primary/10 text-primary',
                    isPending && 'border-muted bg-muted text-muted-foreground opacity-50'
                )}
            >
                {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                ) : (
                    step.icon
                )}
            </div>

            {!isLast && (
                <div
                    className={cn(
                        'mt-1 h-12 w-0.5 transition-colors',
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                    )}
                />
            )}
        </div>
    );
}

interface StepContentProps {
    step: TimelineStep;
    currentStep: number;
    startDate?: string;
    endDate?: string;
    pickupLocation?: string;
}

function StepContent({
    step,
    currentStep,
    startDate,
    endDate,
    pickupLocation,
}: StepContentProps) {
    const isCompleted = step.id < currentStep;
    const isCurrent = step.id === currentStep;
    const isPending = step.id > currentStep;

    const getStepDetails = () => {
        if (!isCurrent) return null;

        switch (step.id) {
            case 1:
                return startDate ? `Starts ${format(new Date(startDate), 'MMM d, yyyy')}` : null;
            case 2:
                return pickupLocation || 'San Francisco Airport';
            case 3:
                return endDate ? `Returns ${format(new Date(endDate), 'MMM d, yyyy')}` : null;
            case 4:
                return 'Thank you for choosing us!';
            default:
                return null;
        }
    };

    const details = getStepDetails();

    return (
        <div className={cn('min-w-0 flex-1 pb-8', isPending && 'opacity-50')}>
            <p
                className={cn(
                    'font-medium',
                    isCompleted && 'text-green-600',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground'
                )}
            >
                {step.label}
            </p>
            <p className="text-sm text-muted-foreground">{step.description}</p>

            {isCurrent && details && (
                <Card className="mt-3 border-primary/20 bg-primary/5">
                    <CardContent className="flex items-center gap-2 p-3">
                        {step.id === 2 ? (
                            <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                            <Calendar className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span className="text-sm font-medium text-primary">{details}</span>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export const RentalTimeline = memo(function RentalTimeline({
    status,
    startDate,
    endDate,
    pickupLocation,
    className,
}: RentalTimelineProps) {
    const currentStep = getStepFromStatus(status);

    if (status === 'Cancelled') {
        return (
            <div className={cn('space-y-4', className)}>
                <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                    <XCircle className="h-6 w-6 shrink-0 text-destructive" />
                    <div>
                        <p className="font-semibold text-destructive">Rental Cancelled</p>
                        <p className="text-sm text-muted-foreground">
                            This rental has been cancelled.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('relative', className)} role="list" aria-label="Rental timeline">
            {TIMELINE_STEPS.map((step, index) => (
                <div
                    key={step.id}
                    className="relative flex gap-4"
                    role="listitem"
                    aria-current={step.id === currentStep ? 'step' : undefined}
                >
                    <StepIndicator
                        step={step}
                        currentStep={currentStep}
                        isLast={index === TIMELINE_STEPS.length - 1}
                    />
                    <StepContent
                        step={step}
                        currentStep={currentStep}
                        startDate={startDate}
                        endDate={endDate}
                        pickupLocation={pickupLocation}
                    />
                </div>
            ))}
        </div>
    );
});
