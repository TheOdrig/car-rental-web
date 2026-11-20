'use client';

import React, { useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { useFilterStore } from '../model/store';
import { useFilterOptions } from '@/entities/car';
import { Skeleton } from '@/shared/ui/skeleton';
import { PriceRangeSlider } from './price-range-slider';
import { cn, formatCurrency } from '@/shared/lib';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';
import { useCurrency } from '@/entities/currency';

interface FilterSidebarProps {
    className?: string;
}

export function FilterSidebar({ className }: FilterSidebarProps) {
    const { filters, setFilter, setFilters, clearFilters, hasActiveFilters } = useFilterStore();
    const { isConverted, format } = useCurrency();
    const { data: options, isLoading, isError } = useFilterOptions();
    const bodyTypes = options?.bodyTypes ?? [];
    const transmissionTypes = options?.transmissionTypes ?? [];
    const fuelTypes = options?.fuelTypes ?? [];

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
                        className="h-11 px-2 md:h-8 text-muted-foreground hover:text-foreground"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset All
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                <FilterSection title={`Price range per day (${DEFAULT_CURRENCY})`}>
                    <PriceRangeSlider
                        min={0}
                        max={500}
                        step={10}
                        defaultValue={[filters.minPrice ?? 0, filters.maxPrice ?? 500]}
                        onValueCommit={handlePriceRangeCommit}
                        formatPrice={(v) => formatCurrency(v, DEFAULT_CURRENCY, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    />
                    {isConverted(DEFAULT_CURRENCY) && (
                        <p className="text-xs text-muted-foreground" data-testid="price-filter-note">
                            Filtered in {DEFAULT_CURRENCY}, about {format(filters.minPrice ?? 0, DEFAULT_CURRENCY)} to {format(filters.maxPrice ?? 500, DEFAULT_CURRENCY)} in your currency.
                        </p>
                    )}
                </FilterSection>

                <FilterSection title="Body Type">
                    <OptionsState isLoading={isLoading} isError={isError} isEmpty={bodyTypes.length === 0} />
                    <div className="space-y-3">
                        {bodyTypes.map((value) => ({ value, label: value })).map((type) => (
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

                <FilterSection title="Transmission">
                    <OptionsState isLoading={isLoading} isError={isError} isEmpty={transmissionTypes.length === 0} />
                    <div className="flex gap-2">
                        {transmissionTypes.map((value) => ({ value, label: value })).map((type) => (
                            <Button
                                key={type.value}
                                variant="outline"
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
                    <OptionsState isLoading={isLoading} isError={isError} isEmpty={fuelTypes.length === 0} />
                    <div className="space-y-3">
                        {fuelTypes.map((value) => ({ value, label: value })).map((type) => (
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

function OptionsState({ isLoading, isError, isEmpty }: { isLoading: boolean; isError: boolean; isEmpty: boolean }) {
    if (isLoading) return <Skeleton className="h-16 w-full" />;
    if (isError) return <p className="text-sm text-muted-foreground">Filter options could not be loaded.</p>;
    if (isEmpty) return <p className="text-sm text-muted-foreground">No options available.</p>;
    return null;
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
