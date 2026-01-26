'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarCard, CarCardSkeleton } from '@/components/cars';
import { useFeaturedCars } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import type { Car } from '@/types';

interface FeaturedCarouselProps {
    title?: string;
    subtitle?: string;
    viewAllLink?: string;
    className?: string;
}

export function FeaturedCarousel({
    title = 'Featured Vehicles',
    subtitle = 'Our curated collection of premium rentals',
    viewAllLink = '/cars',
    className,
}: FeaturedCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { data, isLoading, error } = useFeaturedCars();

    const cars = data?.content ?? [];

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;

        const scrollAmount = 320;
        const newScrollLeft =
            direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount;

        scrollRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
        });
    };

    if (error) {
        return null;
    }

    return (
        <section className={cn('py-12', className)}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                        {subtitle && (
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => scroll('left')}
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => scroll('right')}
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Link href={viewAllLink}>
                            <Button variant="ghost" className="gap-1">
                                View all
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <FeaturedCarouselSkeleton />
                ) : cars.length === 0 ? (
                    <FeaturedCarouselEmpty />
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {cars.map((car: Car) => (
                            <div
                                key={car.id}
                                className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start"
                            >
                                <CarCard car={car} variant="compact" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function FeaturedCarouselSkeleton() {
    return (
        <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px]">
                    <CarCardSkeleton variant="compact" />
                </div>
            ))}
        </div>
    );
}

function FeaturedCarouselEmpty() {
    return (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            <p>No featured cars available at the moment.</p>
            <Link href="/cars">
                <Button variant="link" className="mt-2">
                    Browse all cars
                </Button>
            </Link>
        </div>
    );
}

export { FeaturedCarouselSkeleton };

