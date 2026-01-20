'use client';

import { memo } from 'react';
import { DynamicImage } from '@/components/ui/dynamic-image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/lib/providers/currency-provider';
import { mapCurrency, type SimilarCar } from '@/types';

interface SimilarCarCardProps {
    car: SimilarCar;
    className?: string;
}

export const SimilarCarCard = memo(function SimilarCarCard({
    car,
    className,
}: SimilarCarCardProps) {
    const { format } = useCurrency();
    const imageUrl = car.imageUrl ?? '/images/car-placeholder.svg';
    const sourceCurrency = mapCurrency(car.currency);
    const badges = car.similarityReasons?.slice(0, 2) ?? [];

    return (
        <Link
            href={`/cars/${car.id}`}
            className={cn('block focus-visible:outline-none', className)}
        >
            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary">
                <div className="relative aspect-[16/10] overflow-hidden">
                    <DynamicImage
                        src={imageUrl}
                        alt={`${car.brand} ${car.model} ${car.productionYear} - Available for rent`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />

                    {badges.length > 0 && (
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {badges.map((reason) => (
                                <Badge
                                    key={reason}
                                    variant="secondary"
                                    className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-xs backdrop-blur-sm"
                                >
                                    {reason}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <CardContent className="p-3">
                    <h4 className="font-semibold text-base leading-tight mb-0.5 text-slate-900 dark:text-slate-100">
                        {car.brand} {car.model}
                    </h4>
                    <p className="text-muted-foreground text-sm mb-2">
                        {car.productionYear}
                        {car.bodyType && <span className="ml-1">• {car.bodyType}</span>}
                    </p>

                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {format(car.dailyRate, sourceCurrency)}
                        </span>
                        <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
});

export function SimilarCarCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <Skeleton className="aspect-[16/10] rounded-none" />
            <CardContent className="p-3">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
            </CardContent>
        </Card>
    );
}
