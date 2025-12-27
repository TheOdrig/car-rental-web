'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    CarGrid,
    CarGridSkeleton,
    FilterSidebar,
    ActiveFilters,
    ViewToggle,
    CarListView,
    CarListViewSkeleton,
    SortDropdown,
} from '@/components/cars';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useCars } from '@/lib/hooks';
import { useFilterStore, type SortOption } from '@/lib/stores/filter-store';
import type { Car, AvailableCar } from '@/types';



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
        case 'rating-desc':
            return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
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
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const {
        filters,
        viewMode,
        sortBy,
        page,
        setViewMode,
        setSortBy,
        setPage,
        hasActiveFilters,
    } = useFilterStore();
    const { data, isLoading, error, refetch } = useCars(filters, page);

    const totalCars = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;

    const sortedCars = useMemo(() => {
        const cars = data?.content ?? [];
        return sortCars(cars, sortBy);
    }, [data?.content, sortBy]);

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
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <FilterSidebar />
                    </div>
                </aside>

                {/* Mobile Filter Sheet */}
                <div className="lg:hidden">
                    <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-center gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {hasActiveFilters() && (
                                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                                        Active
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                                <FilterSidebar />
                            </div>
                            <div className="mt-6 pt-6 border-t">
                                <Button
                                    className="w-full"
                                    onClick={() => setMobileFiltersOpen(false)}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <main className="flex-1 min-w-0">
                    <ActiveFilters className="mb-4" />

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
                            <SortDropdown value={sortBy} onChange={setSortBy} />

                            <ViewToggle value={viewMode} onChange={setViewMode} />
                        </div>
                    </div>

                    {isLoading ? (
                        viewMode === 'grid' ? (
                            <CarGridSkeleton count={8} />
                        ) : (
                            <CarListViewSkeleton count={4} />
                        )
                    ) : viewMode === 'grid' ? (
                        <CarGrid cars={sortedCars} />
                    ) : (
                        <CarListView cars={sortedCars} />
                    )}

                    {!isLoading && totalCars > 0 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <PaginationInfo
                                currentPage={page}
                                pageSize={12}
                                totalElements={totalCars}
                            />
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
