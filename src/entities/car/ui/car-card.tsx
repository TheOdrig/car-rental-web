'use client';

import { memo } from 'react';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import Link from 'next/link';
import { Fuel, Users, Settings2 } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { mapCurrency } from '@/entities/currency/@x/car';
import { CarPriceAmount } from './car-price';
import { type Car, type AvailableCar } from '../model/types';
import { CarStatusBadge } from './car-status-badge';
import { ROUTES } from '@/shared/config/routes';

interface CarCardProps {
    car: Car | AvailableCar;
    variant?: 'default' | 'compact' | 'search-result';
    className?: string;
    showStatus?: boolean;
    priority?: boolean;
    sizes?: string;
    headingLevel?: 'h2' | 'h3';
    onSelect?: (car: Car | AvailableCar) => void;
}

interface CarCardSkeletonProps {
    variant?: 'default' | 'compact' | 'search-result';
    className?: string;
}

function isAvailableCar(car: Car | AvailableCar): car is AvailableCar {
    return 'dailyRate' in car;
}

export const CAR_CARD_SIZES = '(max-width: 639px) 50vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw';

export const CarCard = memo(function CarCard({
    car,
    variant = 'default',
    className,
    showStatus = false,
    priority = false,
    sizes = CAR_CARD_SIZES,
    headingLevel: Heading = 'h3',
    onSelect,
}: CarCardProps) {
        const isSearchResult = isAvailableCar(car);

    const brand = car.brand;
    const model = car.model;
    const year = isSearchResult ? car.productionYear : car.productionYear;
    const imageUrl = (isSearchResult ? undefined : car.thumbnailUrl) || car.imageUrl || '/images/car-placeholder.svg';
    const fuelType = isSearchResult ? car.fuelType : car.fuelType;
    const transmission = isSearchResult ? car.transmissionType : car.transmissionType;
    const seats = car.seats;

    const price = isSearchResult ? car.dailyRate : car.price;
    const sourceCurrency = mapCurrency(isSearchResult ? car.currency : car.currencyType);
    const totalPrice = isSearchResult ? car.totalPrice : undefined;

    const status = isSearchResult ? undefined : car.carStatusType;

    const cardContent = (
        <Card
            className={cn(
                'group h-full gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-md cursor-pointer',
                className
            )}
            onClick={() => onSelect?.(car)}
        >
            <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                <DynamicImage
                    src={imageUrl}
                    alt={`${brand} ${model} ${year} - Car available for rent`}
                    fill
                    sizes={sizes}
                    priority={priority}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {showStatus && status && (
                    <CarStatusBadge
                        status={status}
                        audience="public"
                        className="absolute top-2 right-2 sm:top-3 sm:right-3"
                    />
                )}

                {isSearchResult && car.appliedDiscounts && car.appliedDiscounts.length > 0 && (
                    <Badge
                        variant="default"
                        className="absolute top-2 left-2 max-w-[calc(100%-1rem)] sm:top-3 sm:left-3"
                    >
                        {car.appliedDiscounts[0]}
                    </Badge>
                )}
            </div>

            <CardContent className={cn('flex flex-1 flex-col p-3 sm:p-4', variant === 'compact' && 'sm:p-3')}>
                <Heading className="font-semibold text-base sm:text-lg leading-tight mb-0.5 sm:mb-1 line-clamp-1 sm:line-clamp-2 break-words" title={`${brand} ${model}`}>
                    {brand} {model}
                </Heading>
                <p className="text-muted-foreground text-sm mb-1.5 sm:mb-3">{year}</p>

                <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                    {fuelType && (
                        <div className="flex items-center gap-1" title="Fuel Type">
                            <Fuel className="h-4 w-4" aria-hidden="true" />
                            <span>{fuelType}</span>
                        </div>
                    )}
                    {transmission && (
                        <div className="flex items-center gap-1" title="Transmission">
                            <Settings2 className="h-4 w-4" aria-hidden="true" />
                            <span>{transmission}</span>
                        </div>
                    )}
                    {seats && (
                        <div className="flex items-center gap-1" title="Seats">
                            <Users className="h-4 w-4" aria-hidden="true" />
                            <span>{seats}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                    <div className="whitespace-nowrap">
                        <CarPriceAmount
                            amount={price}
                            from={sourceCurrency}
                            className="text-lg sm:text-xl font-bold text-foreground"
                        />
                        <span className="ml-0.5 text-xs sm:text-sm text-muted-foreground">/day</span>
                    </div>
                    {totalPrice && (
                        <div className="whitespace-nowrap text-xs sm:text-right sm:text-sm">
                            <span className="text-muted-foreground">Total: </span>
                            <CarPriceAmount amount={totalPrice} from={sourceCurrency} className="font-semibold" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (!onSelect) {
        return (
            <Link href={ROUTES.cars.detail(car.id)} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
});

export function CarCardSkeleton({ variant = 'default', className }: CarCardSkeletonProps) {
    return (
        <Card className={cn('h-full gap-0 overflow-hidden py-0', className)}>
            <Skeleton className="aspect-[4/3] rounded-none sm:aspect-[16/10]" />

            <CardContent className={cn('p-3 sm:p-4', variant === 'compact' && 'sm:p-3')}>
                <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-2 sm:mb-3" />

                <div className="hidden sm:flex items-center gap-4 mb-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                </div>

                <div className="flex items-baseline justify-between">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </CardContent>
        </Card>
    );
}