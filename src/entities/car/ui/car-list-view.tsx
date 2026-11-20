'use client';

import { DynamicImage } from '@/shared/ui/dynamic-image';
import Link from 'next/link';
import { Fuel, Users, Settings2, Calendar, Star } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { cn } from '@/shared/lib';
import { ConvertedPricesNote, mapCurrency } from '@/entities/currency/@x/car';
import { CarPriceAmount } from './car-price';
import type { Car, AvailableCar } from '../model/types';
import { ROUTES } from '@/shared/config/routes';

interface CarListItemProps {
    car: Car | AvailableCar;
    className?: string;
    priority?: boolean;
    headingLevel?: 'h2' | 'h3';
}

function getCarDisplayData(car: Car | AvailableCar) {
    const isAvailableCar = 'dailyRate' in car;

    return {
        id: car.id,
        brand: car.brand,
        model: car.model,
        year: car.productionYear,
        imageUrl: isAvailableCar ? car.imageUrl : car.thumbnailUrl || car.imageUrl,
        price: isAvailableCar ? car.dailyRate : car.price,
        currency: isAvailableCar ? car.currency : car.currencyType,
        bodyType: car.bodyType,
        fuelType: car.fuelType,
        transmission: car.transmissionType,
        seats: car.seats,
        rating: car.rating,
    };
}

export function CarListItem({ car, className, priority = false, headingLevel: Heading = 'h3' }: CarListItemProps) {
    const data = getCarDisplayData(car);
    const sourceCurrency = mapCurrency(data.currency);

    return (
        <Card className={cn('group relative gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-md', className)}>
            <div className="flex flex-row">
                <div className="relative min-h-24 w-28 flex-shrink-0 self-stretch sm:h-auto sm:min-h-[200px] sm:w-72">
                    <Link href={ROUTES.cars.detail(data.id)} aria-label={`${data.brand} ${data.model}`} className="block h-full">
                        {data.imageUrl ? (
                            <DynamicImage
                                src={data.imageUrl}
                                alt={`${data.brand} ${data.model}`}
                                fill
                                priority={priority}
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 639px) 112px, 288px"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground text-xs sm:text-base">No Image</span>
                            </div>
                        )}
                    </Link>
                    {data.bodyType && (
                        <Badge className="absolute top-3 left-3 hidden sm:inline-flex" variant="secondary">
                            {data.bodyType}
                        </Badge>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-6">
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 sm:mb-3 sm:gap-4">
                            <div className="min-w-0">
                                <Link
                                    href={ROUTES.cars.detail(data.id)}
                                    className="block max-sm:after:absolute max-sm:after:inset-0 max-sm:after:content-['']"
                                >
                                    <Heading className="truncate text-base font-semibold transition-colors hover:text-primary sm:text-lg">
                                        {data.brand} {data.model}
                                    </Heading>
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    {data.year}
                                </p>
                            </div>
                            {data.rating && (
                                <div className="flex items-center gap-1 text-warning-subtle-foreground">
                                    <Star className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
                                    <span className="text-xs font-medium sm:text-sm">{data.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-1 flex flex-nowrap gap-x-3 overflow-hidden whitespace-nowrap text-xs text-muted-foreground sm:mt-0 sm:mb-4 sm:grid sm:grid-cols-4 sm:gap-3 sm:text-sm">
                            {data.transmission && (
                                <div className="flex shrink-0 items-center gap-2">
                                    <Settings2 className="hidden h-4 w-4 sm:block" />
                                    <span>{data.transmission}</span>
                                </div>
                            )}
                            {data.fuelType && (
                                <div className="flex shrink-0 items-center gap-2">
                                    <Fuel className="hidden h-4 w-4 sm:block" />
                                    <span>{data.fuelType}</span>
                                </div>
                            )}
                            {data.seats && (
                                <div className="flex shrink-0 items-center gap-2">
                                    <Users className="hidden h-4 w-4 sm:block" />
                                    <span>{data.seats} seats</span>
                                </div>
                            )}
                            <div className="hidden items-center gap-2 sm:flex">
                                <Calendar className="h-4 w-4" />
                                <span>Available</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between sm:mt-0 sm:border-t sm:pt-4">
                        <div className="whitespace-nowrap">
                            <CarPriceAmount
                                amount={data.price}
                                from={sourceCurrency}
                                className="text-lg font-bold text-foreground sm:text-2xl"
                            />
                            <span className="ml-1 text-xs font-normal text-muted-foreground sm:text-sm">
                                /day
                            </span>
                        </div>
                        <Button asChild className="hidden sm:inline-flex">
                            <Link href={ROUTES.cars.detail(data.id)}>View Details</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

interface CarListViewProps {
    cars: (Car | AvailableCar)[];
    className?: string;
    headingLevel?: 'h2' | 'h3';
}

export function CarListView({ cars, className, headingLevel }: CarListViewProps) {
    if (cars.length === 0) {
        return (
            <EmptyState type="cars" title="No cars found matching your criteria." />
        );
    }

    return (
        <div className={cn('space-y-3 sm:space-y-4', className)}>
            <ConvertedPricesNote from={cars.map((car) => mapCurrency('dailyRate' in car ? car.currency : car.currencyType))} />
            {cars.map((car, index) => (
                <CarListItem key={car.id} car={car} priority={index < 4} headingLevel={headingLevel} />
            ))}
        </div>
    );
}

export function CarListViewSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="gap-0 overflow-hidden py-0">
                    <div className="flex flex-row">
                        <Skeleton className="min-h-24 w-28 flex-shrink-0 self-stretch rounded-none sm:h-[200px] sm:w-72" />
                        <div className="min-w-0 flex-1 p-3 sm:p-6">
                            <div className="mb-2 flex items-start justify-between sm:mb-3">
                                <div>
                                    <Skeleton className="mb-2 h-5 w-32 sm:h-6 sm:w-40" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-5 w-12" />
                            </div>
                            <div className="mb-4 hidden grid-cols-4 gap-3 sm:grid">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="mb-2 h-4 w-40 sm:hidden" />
                            <div className="flex items-center justify-between sm:border-t sm:pt-4">
                                <Skeleton className="h-7 w-24 sm:h-8" />
                                <Skeleton className="hidden h-10 w-28 sm:block" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
