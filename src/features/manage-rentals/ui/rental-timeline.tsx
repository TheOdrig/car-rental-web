'use client';

import { memo, type ReactNode } from 'react';
import {
    CheckCircle2,
    Calendar,
    MapPin,
    Car,
    CheckSquare,
    XCircle,
} from 'lucide-react';
import { cn, formatDate } from '@/shared/lib';
import { Card, CardContent } from '@/shared/ui/card';
import { RentalStatus } from '@/entities/rental';

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
    icon: ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
    { id: 1, label: 'Booking Confirmed', icon: <Calendar className="h-4 w-4" /> },
    { id: 2, label: 'Pick-up Scheduled', icon: <MapPin className="h-4 w-4" /> },
    { id: 3, label: 'Rental Active', icon: <Car className="h-4 w-4" /> },
    { id: 4, label: 'Return & Complete', icon: <CheckSquare className="h-4 w-4" /> },
];

const REQUESTED_FIRST_STEP_LABEL = 'Request Submitted';

function getStepText(
    step: TimelineStep,
    status: RentalStatus,
    currentStep: number,
    startDate?: string,
    endDate?: string
): { label: string; description: string } {
    const done = step.id < currentStep;
    const current = step.id === currentStep;
    const start = startDate ? formatDate(startDate) : null;
    const end = endDate ? formatDate(endDate) : null;

    switch (step.id) {
        case 1:
            return status === RentalStatus.REQUESTED
                ? { label: REQUESTED_FIRST_STEP_LABEL, description: 'Waiting for an admin to review the request' }
                : { label: step.label, description: 'An admin approved the request' };
        case 2:
            return {
                label: step.label,
                description: done ? 'The vehicle was picked up' : start ? `Pick-up from ${start}` : 'Pick-up on the start date',
            };
        case 3:
            return {
                label: step.label,
                description: done ? 'The vehicle was in use' : current ? 'The vehicle is with you' : 'Starts at pick-up',
            };
        default:
            return {
                label: step.label,
                description: current ? 'The vehicle was returned' : end ? `Return due ${end}` : 'Return on the end date',
            };
    }
}

function getStepFromStatus(status: RentalStatus): number {
    switch (status) {
        case RentalStatus.REQUESTED:
            return 1;
        case RentalStatus.CONFIRMED:
            return 1;
        case RentalStatus.IN_USE:
            return 3;
        case RentalStatus.RETURNED:
            return 4;
        case RentalStatus.CANCELLED:
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
                    isCompleted && 'border-emerald-600 bg-emerald-600 text-white',
                    isCurrent && 'border-primary bg-primary/10 text-primary',
                    isPending && 'border-muted bg-muted text-muted-foreground'
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
                        isCompleted ? 'bg-emerald-600' : 'bg-muted'
                    )}
                />
            )}
        </div>
    );
}

interface StepContentProps {
    step: TimelineStep;
    status: RentalStatus;
    currentStep: number;
    startDate?: string;
    endDate?: string;
    pickupLocation?: string;
}

function StepContent({
    step,
    status,
    currentStep,
    startDate,
    endDate,
    pickupLocation,
}: StepContentProps) {
    const isCompleted = step.id < currentStep;
    const isCurrent = step.id === currentStep;
    const isPending = step.id > currentStep;
    const text = getStepText(step, status, currentStep, startDate, endDate);

    const getStepDetails = () => {
        if (!isCurrent) return null;

        switch (step.id) {
            case 1:
                return startDate ? `Starts ${formatDate(startDate)}` : null;
            case 2:
                return pickupLocation ?? null;
            case 3:
                return endDate ? `Returns ${formatDate(endDate)}` : null;
            default:
                return null;
        }
    };

    const details = getStepDetails();

    return (
        <div className="min-w-0 flex-1 pb-8">
            <p
                className={cn(
                    'font-medium',
                    isCompleted && 'text-emerald-700 dark:text-emerald-400',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground'
                )}
            >
                {text.label}
            </p>
            <p className="text-sm text-muted-foreground">{text.description}</p>

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

    if (status === RentalStatus.CANCELLED) {
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
                        status={status}
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
