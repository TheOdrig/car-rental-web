'use client';

import { cn } from '@/shared/lib';
import { ConvertedPricesNote, mapCurrency } from '@/entities/currency/@x/car';
import { useSimilarCars } from '../api/use-cars';
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
            <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Similar Vehicles</h2>
                {similarCars && <ConvertedPricesNote from={similarCars.map((car) => mapCurrency(car.currency))} />}
            </div>

            <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
                role="list"
            >
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <SimilarCarCardSkeleton key={`skeleton-${i}`} />
                    ))
                    : similarCars?.map((car) => (
                        <article key={car.id} role="listitem">
                            <SimilarCarCard car={car} />
                        </article>
                    ))}
            </div>
        </section>
    );
}
