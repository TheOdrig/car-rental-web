'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, RefreshCw, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CarGrid, CarGridSkeleton, FilterSidebar } from '@/components/cars';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useCars } from '@/lib/hooks';
import { useFilterStore } from '@/lib/stores/filter-store';
import { cn } from '@/lib/utils';
import type { Car, AvailableCar } from '@/types';

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
];

function getCarPrice(car: Car | AvailableCar): number {
    if ('dailyRate' in car) {
        return car.dailyRate;
    }
    return car.price;
}

function sortCars(cars: (Car | AvailableCar)[], sortBy: SortOption): (Car | AvailableCar)[] {
    const sorted = [...cars];

    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => getCarPrice(a) - getCarPrice(b));
        case 'price-desc':
            return sorted.sort((a, b) => getCarPrice(b) - getCarPrice(a));
        case 'name-asc':
            return sorted.sort((a, b) =>
                `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
            );
        case 'recommended':
        default:
            return sorted;
    }
}

export function CarsListingContent() {
    const [sortBy, setSortBy] = useState<SortOption>('recommended');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const { filters, hasActiveFilters } = useFilterStore();
    const { data, isLoading, error, refetch } = useCars(filters);

    const cars = data?.content ?? [];
    const totalCars = data?.totalElements ?? 0;

    const sortedCars = useMemo(() => sortCars(cars, sortBy), [cars, sortBy]);

    const breadcrumbItems = [{ label: 'Cars' }];

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb items={breadcrumbItems} className="mb-6" />
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Failed to load cars</h2>
                    <p className="text-muted-foreground mb-6">
                        Something went wrong while loading the car listings.
                    </p>
                    <Button onClick={() => refetch()} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb items={breadcrumbItems} className="mb-6" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Browse Cars</h1>
                <p className="text-muted-foreground">
                    {isLoading
                        ? 'Loading available cars...'
                        : `${totalCars} cars available for rent`}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <FilterSidebar />
                    </div>
                </aside>

                <div className="lg:hidden">
                    <Button
                        variant="outline"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="w-full justify-center gap-2"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                        {hasActiveFilters() && (
                            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                                Active
                            </span>
                        )}
                    </Button>

                    {showMobileFilters && (
                        <div className="mt-4 p-4 border rounded-lg bg-card">
                            <FilterSidebar />
                        </div>
                    )}
                </div>

                <main className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing{' '}
                            <span className="font-medium text-foreground">
                                {sortedCars.length}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-foreground">
                                {totalCars}
                            </span>{' '}
                            cars
                        </p>

                        <div className="flex items-center gap-3">
                            <Select
                                value={sortBy}
                                onValueChange={(value) => setSortBy(value as SortOption)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center border rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0"
                                    aria-label="Grid view"
                                    aria-pressed={viewMode === 'grid'}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="h-8 w-8 p-0"
                                    aria-label="List view"
                                    aria-pressed={viewMode === 'list'}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <CarGridSkeleton
                            count={8}
                            className={cn(
                                viewMode === 'list' && 'grid-cols-1 lg:grid-cols-2'
                            )}
                        />
                    ) : (
                        <CarGrid
                            cars={sortedCars}
                            className={cn(
                                viewMode === 'list' && 'grid-cols-1 lg:grid-cols-2'
                            )}
                        />
                    )}

                    {!isLoading && totalCars > 0 && (
                        <div className="mt-8 flex justify-center">
                            <p className="text-sm text-muted-foreground">
                                Pagination will be added in a future update
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
