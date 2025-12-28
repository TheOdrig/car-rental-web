'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Fuel, Users, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Car, AvailableCar } from '@/types';


interface CarCardProps {
    car: Car | AvailableCar;
    variant?: 'default' | 'compact' | 'search-result';
    className?: string;
    showStatus?: boolean;
    onSelect?: (car: Car | AvailableCar) => void;
}

interface CarCardSkeletonProps {
    variant?: 'default' | 'compact' | 'search-result';
    className?: string;
}


function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'Available':
            return 'default';
        case 'Reserved':
        case 'Maintenance':
            return 'secondary';
        case 'Sold':
        case 'Damaged':
            return 'destructive';
        default:
            return 'outline';
    }
}

function isAvailableCar(car: Car | AvailableCar): car is AvailableCar {
    return 'dailyRate' in car;
}


export const CarCard = memo(function CarCard({
    car,
    variant = 'default',
    className,
    showStatus = false,
    onSelect,
}: CarCardProps) {
    const isSearchResult = isAvailableCar(car);

    const brand = car.brand;
    const model = car.model;
    const year = isSearchResult ? car.productionYear : car.productionYear;
    const imageUrl = car.imageUrl ?? '/images/car-placeholder.svg';
    const fuelType = isSearchResult ? car.fuelType : car.fuelType;
    const transmission = isSearchResult ? car.transmissionType : car.transmissionType;
    const seats = car.seats;

    const price = isSearchResult ? car.dailyRate : car.price;
    const currency = isSearchResult ? car.currency : car.currencyType;
    const totalPrice = isSearchResult ? car.totalPrice : undefined;

    const status = isSearchResult ? undefined : car.carStatusType;

    const cardContent = (
        <Card
            className={cn(
                'group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer',
                variant === 'compact' && 'py-3',
                className
            )}
            onClick={() => onSelect?.(car)}
        >
            <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={`${brand} ${model} ${year} - Car available for rent`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={false}
                />

                {showStatus && status && (
                    <Badge
                        variant={getStatusBadgeVariant(status)}
                        className="absolute top-3 right-3"
                    >
                        {status}
                    </Badge>
                )}

                {isSearchResult && car.appliedDiscounts && car.appliedDiscounts.length > 0 && (
                    <Badge
                        variant="default"
                        className="absolute top-3 left-3 bg-accent text-white"
                    >
                        {car.appliedDiscounts[0]}
                    </Badge>
                )}
            </div>

            <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
                <h3 className="font-semibold text-lg leading-tight mb-1">
                    {brand} {model}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">{year}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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

                <div className="flex items-baseline justify-between">
                    <div>
                        <span className="text-xl font-bold text-primary">
                            {formatPrice(price, currency)}
                        </span>
                        {isSearchResult && (
                            <span className="text-sm text-muted-foreground">/day</span>
                        )}
                    </div>
                    {totalPrice && (
                        <div className="text-right">
                            <span className="text-sm text-muted-foreground">Total: </span>
                            <span className="font-semibold">
                                {formatPrice(totalPrice, currency)}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (!onSelect) {
        return (
            <Link href={`/cars/${car.id}`} className="block">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
});


export function CarCardSkeleton({ variant = 'default', className }: CarCardSkeletonProps) {
    return (
        <Card className={cn('overflow-hidden', variant === 'compact' && 'py-3', className)}>
            <Skeleton className="aspect-[16/10] rounded-none" />

            <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-3" />

                <div className="flex items-center gap-4 mb-4">
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
