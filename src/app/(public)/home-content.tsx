'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarGrid, CarGridSkeleton, CarFilters, CarSearch } from '@/components/cars';
import { useCars } from '@/lib/hooks';
import { useFilterStore } from '@/lib/stores/filter-store';

export function HomeContent() {
    const { filters } = useFilterStore();
    const { data, isLoading, error, refetch } = useCars(filters);

    const cars = data?.content ?? [];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Failed to load cars</h2>
                <p className="text-muted-foreground mb-6">
                    Something went wrong. Please try again.
                </p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <>
            <section className="bg-gradient-to-b from-primary/5 to-background py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Find Your Perfect Ride
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                        Browse our collection of premium vehicles and book your next adventure
                    </p>
                    <CarSearch variant="hero" className="max-w-2xl mx-auto justify-center" />
                </div>
            </section>

            <section className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold">Available Cars</h2>
                    <CarFilters />
                </div>

                {isLoading ? (
                    <CarGridSkeleton count={8} />
                ) : (
                    <CarGrid cars={cars} />
                )}
            </section>
        </>
    );
}
