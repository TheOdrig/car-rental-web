'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/lib/stores/filter-store';
import { cn } from '@/lib/utils';
import type { CarFilters } from '@/types';

interface ActiveFiltersProps {
    className?: string;
}

type FilterKey = keyof CarFilters;

const FILTER_LABELS: Record<FilterKey, string> = {
    brand: 'Brand',
    model: 'Model',
    bodyType: 'Type',
    fuelType: 'Fuel',
    transmissionType: 'Transmission',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    minSeats: 'Seats',
    minProductionYear: 'Min Year',
    maxProductionYear: 'Max Year',
    status: 'Status',
};

function formatFilterValue(key: FilterKey, value: string | number | undefined): string {
    if (value === undefined || value === null) return '';

    if (key === 'minPrice' || key === 'maxPrice') {
        return `$${value}`;
    }

    if (key === 'minSeats') {
        return `${value}+`;
    }

    return String(value);
}

export function ActiveFilters({ className }: ActiveFiltersProps) {
    const { filters, setFilter, clearFilters, hasActiveFilters } = useFilterStore();

    if (!hasActiveFilters()) {
        return null;
    }

    const activeFilters = Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== null && value !== ''
    ) as [FilterKey, string | number][];

    const handleRemoveFilter = (key: FilterKey) => {
        setFilter(key, undefined);
    };

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {activeFilters.map(([key, value]) => (
                <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 text-sm font-normal"
                >
                    <span className="text-muted-foreground">
                        {FILTER_LABELS[key]}:
                    </span>
                    <span className="font-medium">
                        {formatFilterValue(key, value)}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent hover:text-destructive"
                        onClick={() => handleRemoveFilter(key)}
                        aria-label={`Remove ${FILTER_LABELS[key]} filter`}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            ))}

            {activeFilters.length > 1 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={clearFilters}
                >
                    Clear all
                </Button>
            )}
        </div>
    );
}
