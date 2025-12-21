'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFilterStore } from '@/lib/stores/filter-store';

interface CarFiltersProps {
    className?: string;
    layout?: 'horizontal' | 'vertical';
}

const BRANDS = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Volkswagen'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Van'];

export function CarFilters({ className, layout = 'horizontal' }: CarFiltersProps) {
    const { filters, setFilter, clearFilters, hasActiveFilters } = useFilterStore();

    return (
        <div
            className={cn(
                'flex gap-3',
                layout === 'vertical' ? 'flex-col' : 'flex-wrap items-center',
                className
            )}
        >
            <Select
                value={filters.brand ?? ''}
                onValueChange={(value) => setFilter('brand', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                    {BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                            {brand}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.transmissionType ?? ''}
                onValueChange={(value) => setFilter('transmissionType', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Transmission" />
                </SelectTrigger>
                <SelectContent>
                    {TRANSMISSIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                            {t}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.fuelType ?? ''}
                onValueChange={(value) => setFilter('fuelType', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                    {FUEL_TYPES.map((fuel) => (
                        <SelectItem key={fuel} value={fuel}>
                            {fuel}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.bodyType ?? ''}
                onValueChange={(value) => setFilter('bodyType', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Body Type" />
                </SelectTrigger>
                <SelectContent>
                    {BODY_TYPES.map((body) => (
                        <SelectItem key={body} value={body}>
                            {body}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters() && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}
