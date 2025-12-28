'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fuel, Users, Settings2, Calendar, Gauge, Palette, MapPin, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RentalForm } from '@/components/rentals';
import { useAuth } from '@/lib/hooks';
import type { Car, CarAvailabilityCalendar } from '@/types';

interface CarDetailProps {
    car: Car;
    calendar?: CarAvailabilityCalendar;
    showRentalForm?: boolean;
    className?: string;
}

interface CarDetailSkeletonProps {
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

function getStatusColor(status: string): string {
    switch (status) {
        case 'Available': return 'bg-green-500';
        case 'Unavailable': return 'bg-red-500';
        default: return 'bg-gray-300';
    }
}

export function CarDetail({ car, calendar, showRentalForm = true, className }: CarDetailProps) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const specs = [
        { icon: Fuel, label: 'Fuel', value: car.fuelType },
        { icon: Settings2, label: 'Transmission', value: car.transmissionType },
        { icon: Users, label: 'Seats', value: car.seats },
        { icon: Gauge, label: 'Mileage', value: car.kilometer ? `${car.kilometer.toLocaleString()} km` : null },
        { icon: Palette, label: 'Color', value: car.color },
        { icon: Calendar, label: 'Year', value: car.productionYear },
    ].filter(spec => spec.value);

    const isAvailable = car.carStatusType === 'Available';
    const canBook = isAvailable && showRentalForm;

    return (
        <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
            <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-xl">
                    <Image
                        src={car.imageUrl ?? '/images/car-placeholder.svg'}
                        alt={`${car.brand} ${car.model} ${car.productionYear}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        priority
                    />
                    <Badge
                        className="absolute top-4 right-4"
                        variant={isAvailable ? 'default' : 'secondary'}
                    >
                        {car.carStatusType}
                    </Badge>
                </div>

                {calendar && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Availability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AvailabilityCalendar calendar={calendar} />
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        {car.brand} {car.model}
                    </h1>
                    <p className="text-muted-foreground mt-1">{car.productionYear}</p>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">
                        {formatPrice(car.price, car.currencyType)}
                    </span>
                    <span className="text-muted-foreground">/day</span>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {specs.map((spec) => (
                                <div key={spec.label} className="flex items-center gap-3">
                                    <div className="rounded-lg bg-muted p-2">
                                        <spec.icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{spec.label}</p>
                                        <p className="font-medium">{spec.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {car.notes && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{car.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {canBook && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Book This Car</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {authLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : isAuthenticated ? (
                                <RentalForm car={car} />
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground mb-4">
                                        Please log in to book this car
                                    </p>
                                    <Button asChild>
                                        <Link href={`/login?callbackUrl=/cars/${car.id}`}>
                                            <LogIn className="h-4 w-4 mr-2" />
                                            Log In to Book
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!isAvailable && showRentalForm && (
                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardContent className="py-4">
                            <p className="text-center text-amber-600">
                                This car is currently not available for booking.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function AvailabilityCalendar({ calendar }: { calendar: CarAvailabilityCalendar }) {
    if (calendar.carBlocked) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{calendar.blockReason || 'Currently unavailable'}</span>
            </div>
        );
    }


    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Booked</span>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground py-1">
                        {d}
                    </div>
                ))}
                {calendar.days.slice(0, 28).map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            'aspect-square rounded-md flex items-center justify-center text-xs',
                            getStatusColor(day.status)
                        )}
                        title={`${day.date}: ${day.status}`}
                    >
                        {new Date(day.date).getDate()}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CarDetailSkeleton({ className }: CarDetailSkeletonProps) {
    return (
        <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
            <div className="space-y-4">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
            </div>
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-5 w-20 mt-2" />
                </div>
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        </div>
    );
}
