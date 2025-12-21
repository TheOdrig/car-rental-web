'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { CarGrid, CarGridSkeleton, CarGridEmpty, CarSearch } from '@/components/cars';
import { useCarSearchResults } from '@/lib/hooks';
import type { AvailabilitySearchRequest } from '@/types';

function SearchResults() {
    const searchParams = useSearchParams();

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const searchRequest: AvailabilitySearchRequest | null =
        startDate && endDate ? { startDate, endDate } : null;

    const { data, isLoading, error } = useCarSearchResults(searchRequest);

    if (!startDate || !endDate) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-4">Search for Available Cars</h2>
                <p className="text-muted-foreground mb-8">
                    Select your pick-up and return dates to see available vehicles.
                </p>
                <CarSearch variant="hero" className="max-w-xl mx-auto justify-center" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Search Failed</h2>
                <p className="text-muted-foreground">
                    Unable to search for available cars. Please try again.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <CarGridSkeleton count={8} />;
    }

    if (!data || data.cars.length === 0) {
        return (
            <CarGridEmpty
                title="No cars available"
                description={`No cars available from ${startDate} to ${endDate}. Try different dates.`}
                action={<CarSearch variant="compact" />}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                    {data.totalElements} car{data.totalElements !== 1 ? 's' : ''} found for{' '}
                    {data.rentalDays} day{data.rentalDays !== 1 ? 's' : ''}
                </p>
            </div>
            <CarGrid cars={data.cars} variant="search-result" />
        </div>
    );
}

export function SearchContent() {
    return (
        <Suspense fallback={<CarGridSkeleton count={8} />}>
            <SearchResults />
        </Suspense>
    );
}
