'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fuel, Users, Settings2, Calendar, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Car, AvailableCar } from '@/types';

interface CarListItemProps {
    car: Car | AvailableCar;
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

function getCarDisplayData(car: Car | AvailableCar) {
    const isAvailableCar = 'dailyRate' in car;

    return {
        id: car.id,
        brand: car.brand,
        model: car.model,
        year: car.productionYear,
        imageUrl: isAvailableCar ? car.imageUrl : car.imageUrl || car.thumbnailUrl,
        price: isAvailableCar ? car.dailyRate : car.price,
        currency: isAvailableCar ? car.currency : car.currencyType,
        bodyType: car.bodyType,
        fuelType: car.fuelType,
        transmission: car.transmissionType,
        seats: car.seats,
        rating: car.rating,
    };
}

export function CarListItem({ car, className }: CarListItemProps) {
    const data = getCarDisplayData(car);

    return (
        <Card className={cn('group overflow-hidden', className)}>
            <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-72 h-48 sm:h-auto sm:min-h-[200px] flex-shrink-0">
                    <Link href={`/cars/${data.id}`}>
                        {data.imageUrl ? (
                            <Image
                                src={data.imageUrl}
                                alt={`${data.brand} ${data.model}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 288px"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground">No Image</span>
                            </div>
                        )}
                    </Link>
                    {data.bodyType && (
                        <Badge className="absolute top-3 left-3" variant="secondary">
                            {data.bodyType}
                        </Badge>
                    )}
                </div>

                <div className="flex-1 p-4 sm:p-6 flex flex-col">
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <Link href={`/cars/${data.id}`}>
                                    <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                                        {data.brand} {data.model}
                                    </h3>
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    {data.year}
                                </p>
                            </div>
                            {data.rating && (
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="text-sm font-medium">{data.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {data.transmission && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Settings2 className="h-4 w-4" />
                                    <span>{data.transmission}</span>
                                </div>
                            )}
                            {data.fuelType && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Fuel className="h-4 w-4" />
                                    <span>{data.fuelType}</span>
                                </div>
                            )}
                            {data.seats && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{data.seats} seats</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Available</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                            <span className="text-2xl font-bold text-primary">
                                {formatPrice(data.price, data.currency)}
                            </span>
                        </div>
                        <Button asChild>
                            <Link href={`/cars/${data.id}`}>View Details</Link>
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
}

export function CarListView({ cars, className }: CarListViewProps) {
    if (cars.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No cars found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {cars.map((car) => (
                <CarListItem key={car.id} car={car} />
            ))}
        </div>
    );
}

export function CarListViewSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                        <Skeleton className="w-full sm:w-72 h-48 sm:h-[200px]" />
                        <div className="flex-1 p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <Skeleton className="h-6 w-40 mb-2" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-5 w-12" />
                            </div>
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-10 w-28" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
