'use client';

import { cn } from '@/lib/utils';
import { CarCard, CarCardSkeleton } from './car-card';
import type { Car, AvailableCar } from '@/types';
import React from "react";

interface CarGridProps {
    cars: (Car | AvailableCar)[];
    variant?: 'default' | 'compact' | 'search-result';
    className?: string;
    showStatus?: boolean;
    onCarSelect?: (car: Car | AvailableCar) => void;
}

interface CarGridSkeletonProps {
    count?: number;
    variant?: 'default' | 'compact' | 'search-result';
    className?: string;
}

interface EmptyStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export function CarGrid({
    cars,
    variant = 'default',
    className,
    showStatus = false,
    onCarSelect,
}: CarGridProps) {
    if (cars.length === 0) {
        return <CarGridEmpty />;
    }

    return (
        <div
            className={cn(
                'grid gap-6',
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                className
            )}
        >
            {cars.map((car) => (
                <CarCard
                    key={car.id}
                    car={car}
                    variant={variant}
                    showStatus={showStatus}
                    onSelect={onCarSelect}
                />
            ))}
        </div>
    );
}

export function CarGridSkeleton({
    count = 8,
    variant = 'default',
    className,
}: CarGridSkeletonProps) {
    return (
        <div
            className={cn(
                'grid gap-6',
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                className
            )}
        >
            {Array.from({ length: count }).map((_, index) => (
                <CarCardSkeleton key={index} variant={variant} />
            ))}
        </div>
    );
}

export function CarGridEmpty({
    title = 'No cars found',
    description = 'Try adjusting your search or filter criteria.',
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
                <svg
                    className="h-12 w-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M3 3h18v18H3V3z"
                    />
                </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {action}
        </div>
    );
}
