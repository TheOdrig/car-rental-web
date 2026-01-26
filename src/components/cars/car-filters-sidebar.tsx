'use client';

import React, { useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFilterStore } from '@/lib/stores/filter-store';
import { PriceRangeSlider } from './price-range-slider';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
    className?: string;
}

const BODY_TYPES = [
    { value: 'SUV', label: 'SUV' },
    { value: 'Sedan', label: 'Sedan' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'Coupe', label: 'Coupe' },
    { value: 'Convertible', label: 'Convertible' },
    { value: 'Van', label: 'Van' },
];

const CAPACITY_OPTIONS = [2, 4, 5, 7];

const TRANSMISSION_TYPES = [
    { value: 'Automatic', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' },
];

const FUEL_TYPES = [
    { value: 'Gasoline', label: 'Gasoline' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' },
    { value: 'Hybrid', label: 'Hybrid' },
];

export function FilterSidebar({ className }: FilterSidebarProps) {
    const { filters, setFilter, setFilters, clearFilters, hasActiveFilters } = useFilterStore();

    const handlePriceRangeCommit = useCallback(
        (value: [number, number]) => {
            setFilters({
                minPrice: value[0] > 0 ? value[0] : undefined,
                maxPrice: value[1] < 500 ? value[1] : undefined,
            });
        },
        [setFilters]
    );

    const handleBodyTypeChange = useCallback(
        (bodyType: string, checked: boolean) => {
            setFilter('bodyType', checked ? bodyType : undefined);
        },
        [setFilter]
    );

    const handleCapacityChange = useCallback(
        (capacity: number) => {
            const currentMinSeats = filters.minSeats;
            setFilter('minSeats', currentMinSeats === capacity ? undefined : capacity);
        },
        [filters.minSeats, setFilter]
    );

    const handleTransmissionChange = useCallback(
        (transmission: string) => {
            const current = filters.transmissionType;
            setFilter('transmissionType', current === transmission ? undefined : transmission);
        },
        [filters.transmissionType, setFilter]
    );

    const handleFuelTypeChange = useCallback(
        (fuelType: string, checked: boolean) => {
            setFilter('fuelType', checked ? fuelType : undefined);
        },
        [setFilter]
    );

    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                {hasActiveFilters() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset All
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                <FilterSection title="Price Range ($/day)">
                    <PriceRangeSlider
                        min={0}
                        max={500}
                        step={10}
                        defaultValue={[filters.minPrice ?? 0, filters.maxPrice ?? 500]}
                        onValueCommit={handlePriceRangeCommit}
                        formatPrice={(v) => `$${v}`}
                    />
                </FilterSection>

                <FilterSection title="Body Type">
                    <div className="space-y-3">
                        {BODY_TYPES.map((type) => (
                            <div key={type.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`body-${type.value}`}
                                    checked={filters.bodyType === type.value}
                                    onCheckedChange={(checked) =>
                                        handleBodyTypeChange(type.value, checked === true)
                                    }
                                />
                                <Label
                                    htmlFor={`body-${type.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {type.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title="Capacity">
                    <div className="flex flex-wrap gap-2">
                        {CAPACITY_OPTIONS.map((capacity) => (
                            <Button
                                key={capacity}
                                variant="filter-toggle"
                                size="sm"
                                onClick={() => handleCapacityChange(capacity)}
                                className="min-w-[48px]"
                                aria-pressed={filters.minSeats === capacity}
                                data-selected={filters.minSeats === capacity}
                            >
                                {capacity === 7 ? '7+' : capacity}
                            </Button>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title="Transmission">
                    <div className="flex gap-2">
                        {TRANSMISSION_TYPES.map((type) => (
                            <Button
                                key={type.value}
                                variant="filter-toggle"
                                size="sm"
                                onClick={() => handleTransmissionChange(type.value)}
                                className="flex-1"
                                aria-pressed={filters.transmissionType === type.value}
                                data-selected={filters.transmissionType === type.value}
                            >
                                {type.label}
                            </Button>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title="Fuel Type">
                    <div className="space-y-3">
                        {FUEL_TYPES.map((type) => (
                            <div key={type.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`fuel-${type.value}`}
                                    checked={filters.fuelType === type.value}
                                    onCheckedChange={(checked) =>
                                        handleFuelTypeChange(type.value, checked === true)
                                    }
                                />
                                <Label
                                    htmlFor={`fuel-${type.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {type.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </FilterSection>
            </div>
        </div>
    );
}

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            {children}
        </div>
    );
}

