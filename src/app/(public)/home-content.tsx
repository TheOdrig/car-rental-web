'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarGrid, CarGridSkeleton, CarFilters } from '@/components/cars';
import { HeroSection, FeaturedCarousel, PromotionalBanners } from '@/components/home';
import { useCars } from '@/lib/hooks';
import { useFilterStore } from '@/lib/stores/filter-store';

export function HomeContent() {
    const { filters } = useFilterStore();
    const homeFilters = { ...filters, carStatusType: 'AVAILABLE' };
    const { data, isLoading, error, refetch } = useCars(homeFilters);

    const cars = data?.content ?? data?.cars ?? [];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Failed to load cars</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
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
            <HeroSection />

            <FeaturedCarousel className="bg-slate-50 dark:bg-slate-950" />

            <PromotionalBanners />

            <section className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">All Available Cars</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Browse our complete collection
                        </p>
                    </div>
                    <CarFilters />
                </div>

                {isLoading ? (
                    <CarGridSkeleton count={8} />
                ) : (
                    <CarGrid cars={cars} />
                )}
            </section>

            { }
        </>
    );
}
