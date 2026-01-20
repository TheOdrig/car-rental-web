'use client';

import { cn } from '@/lib/utils';
import { useSimilarCars } from '@/lib/hooks/use-cars';
import { SimilarCarCard, SimilarCarCardSkeleton } from './similar-car-card';

interface SimilarCarsSectionProps {
    carId: number;
    className?: string;
}

export function SimilarCarsSection({ carId, className }: SimilarCarsSectionProps) {
    const { data: similarCars, isLoading, isError } = useSimilarCars(carId);

    if (isError || (!isLoading && (!similarCars || similarCars.length === 0))) {
        return null;
    }

    return (
        <section
            aria-label="Similar vehicles you might like"
            className={cn('py-8', className)}
        >
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Similar Vehicles
                </h2>
                <p className="text-muted-foreground mt-1">
                    You might also like these alternatives
                </p>
            </div>

            <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto snap-x snap-mandatory"
                role="list"
            >
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <SimilarCarCardSkeleton
                            key={`skeleton-${i}`}
                            className="snap-start"
                        />
                    ))
                    : similarCars?.map((car) => (
                        <article key={car.id} role="listitem" className="snap-start">
                            <SimilarCarCard car={car} />
                        </article>
                    ))}
            </div>
        </section>
    );
}
