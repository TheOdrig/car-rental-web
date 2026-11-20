'use client';

import { cn } from '@/shared/lib';
import { useSimilarCars } from '@/entities/car';
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
        <section aria-label="Similar vehicles" className={cn('py-8', className)}>
            <h2 className="mb-6 text-2xl font-bold text-foreground">Similar Vehicles</h2>

            <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto snap-x snap-mandatory"
                role="list"
            >
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <SimilarCarCardSkeleton key={`skeleton-${i}`} className="snap-start" />
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
