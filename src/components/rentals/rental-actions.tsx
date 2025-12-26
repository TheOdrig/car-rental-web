'use client';

import { memo, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Rental, RentalStatus, ActionButton } from '@/types';
import { getActionButtons } from '@/lib/utils/rental-utils';

interface RentalActionsProps {
    rental: Rental;
    status?: RentalStatus;
    onAction: (action: string, rental: Rental) => void | Promise<void>;
    className?: string;
    size?: 'default' | 'sm' | 'lg';
    orientation?: 'horizontal' | 'vertical';
}

interface ActionButtonStates {
    [action: string]: boolean;
}

export const RentalActions = memo(function RentalActions({
    rental,
    status,
    onAction,
    className,
    size = 'default',
    orientation = 'horizontal',
}: RentalActionsProps) {
    const [loadingStates, setLoadingStates] = useState<ActionButtonStates>({});

    const effectiveStatus = status ?? rental.status;
    const actions = getActionButtons(effectiveStatus);

    const handleAction = useCallback(
        async (action: ActionButton) => {
            if (loadingStates[action.action]) return;

            setLoadingStates((prev) => ({ ...prev, [action.action]: true }));

            try {
                await onAction(action.action, rental);
            } finally {
                setLoadingStates((prev) => ({ ...prev, [action.action]: false }));
            }
        },
        [loadingStates, onAction, rental]
    );

    if (actions.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex gap-2',
                orientation === 'vertical' && 'flex-col',
                className
            )}
            role="group"
            aria-label="Rental actions"
        >
            {actions.map((action) => {
                const isLoading = loadingStates[action.action];

                return (
                    <Button
                        key={action.action}
                        variant={action.variant}
                        size={size}
                        disabled={isLoading}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void handleAction(action);
                        }}
                        className={cn(
                            'transition-all',
                            isLoading && 'opacity-70'
                        )}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {action.label}
                    </Button>
                );
            })}
        </div>
    );
});

interface RentalActionsSkeletonProps {
    count?: number;
    className?: string;
    size?: 'default' | 'sm' | 'lg';
    orientation?: 'horizontal' | 'vertical';
}

export function RentalActionsSkeleton({
    count = 2,
    className,
    size = 'default',
    orientation = 'horizontal',
}: RentalActionsSkeletonProps) {
    const buttonWidth = size === 'sm' ? 'w-20' : size === 'lg' ? 'w-32' : 'w-24';
    const buttonHeight = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10';

    return (
        <div
            className={cn(
                'flex gap-2',
                orientation === 'vertical' && 'flex-col',
                className
            )}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'animate-pulse rounded-md bg-muted',
                        buttonWidth,
                        buttonHeight
                    )}
                />
            ))}
        </div>
    );
}
