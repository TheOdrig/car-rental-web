'use client';

import { memo } from 'react';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import Link from 'next/link';
import { cn } from '@/shared/lib';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { mapCurrency } from '@/entities/currency/@x/car';
import { CarPriceAmount } from './car-price';
import { type SimilarCar } from '../model/types';
import { ROUTES } from '@/shared/config/routes';

interface SimilarCarCardProps {
    car: SimilarCar;
    className?: string;
}

export const SimilarCarCard = memo(function SimilarCarCard({
    car,
    className,
}: SimilarCarCardProps) {
    const imageUrl = car.imageUrl ?? '/images/car-placeholder.svg';
    const sourceCurrency = mapCurrency(car.currency);
    const badges = car.similarityReasons?.slice(0, 2) ?? [];

    return (
        <Link
            href={ROUTES.cars.detail(car.id)}
            className={cn('block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
        >
            <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                    <DynamicImage
                        src={imageUrl}
                        alt={`${car.brand} ${car.model} ${car.productionYear} - Available for rent`}
                        fill
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />

                    {badges.length > 0 && (
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {badges.map((reason, index) => (
                                <Badge
                                    key={reason}
                                    variant="secondary"
                                    className={cn('bg-card text-foreground text-xs', index > 0 && 'hidden sm:inline-flex')}
                                >
                                    {reason}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <CardContent className="p-3">
                    <h3 className="font-semibold text-base leading-tight mb-0.5 text-foreground truncate sm:whitespace-normal" title={`${car.brand} ${car.model}`}>
                        {car.brand} {car.model}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-1.5 sm:mb-2 truncate">
                        {car.productionYear}
                        {car.bodyType && <span className="ml-1">• {car.bodyType}</span>}
                    </p>

                    <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                        <CarPriceAmount amount={car.dailyRate} from={sourceCurrency} className="text-lg font-bold text-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">/day</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
});

export function SimilarCarCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <Skeleton className="aspect-[4/3] rounded-none sm:aspect-[16/10]" />
            <CardContent className="p-3">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
            </CardContent>
        </Card>
    );
}