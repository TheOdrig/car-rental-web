'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useCars } from '@/entities/car';
import { HeroSection, FeaturedCarousel, PromotionalBanners } from '@/widgets/home';

export function HomeContent() {
    const { data } = useCars({ carStatusType: 'AVAILABLE' }, 0);
    const available = data?.totalElements;

    return (
        <>
            <HeroSection />

            <FeaturedCarousel className="bg-muted/30" subtitle="The most recently added cars that are available to book" />

            <PromotionalBanners />

            <section className="border-t">
                <div className="container mx-auto flex flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Looking for something specific?</h2>
                        <p className="mt-1 text-muted-foreground">
                            {available !== undefined
                                ? `${available} ${available === 1 ? 'car is' : 'cars are'} available right now. Filter by brand, transmission, fuel type or body type.`
                                : 'Filter the fleet by brand, transmission, fuel type or body type.'}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/cars">
                            Browse all cars
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
