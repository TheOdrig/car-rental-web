'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import { DynamicImage } from '@/components/ui/dynamic-image';
import Link from 'next/link';
import {
    Fuel, Users, Settings2, Calendar, Gauge, Palette,
    MapPin, LogIn, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RentalForm } from '@/components/rentals';
import { useAuth, useCarCalendar } from '@/lib/hooks';
import { useCurrency } from '@/lib/providers/currency-provider';
import { mapCurrency, type Car, type CarAvailabilityCalendar, type DayAvailability } from '@/types';

interface CarDetailProps {
    car: Car;
    calendar?: CarAvailabilityCalendar;
    showRentalForm?: boolean;
    className?: string;
}

interface CarDetailSkeletonProps {
    className?: string;
}





const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function CarDetail({ car, calendar, showRentalForm = true, className }: CarDetailProps) {
    const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { format: formatPrice } = useCurrency();
    const sourceCurrency = mapCurrency(car.currencyType);

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
    const showAuthLoading = !mounted || authLoading;

    return (
        <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
            <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-xl">
                    <DynamicImage
                        src={car.imageUrl ?? '/images/car-placeholder.svg'}
                        alt={`${car.brand} ${car.model} ${car.productionYear}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        priority
                    />
                </div>

                {calendar && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Availability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AvailabilityCalendar initialCalendar={calendar} carId={car.id} />
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
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                        {formatPrice(car.price, sourceCurrency)}
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
                            {showAuthLoading ? (
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

function AvailabilityCalendar({ initialCalendar, carId }: { initialCalendar: CarAvailabilityCalendar; carId: number }) {
    const [currentDate, setCurrentDate] = useState(() => {
        return parse(initialCalendar.month, 'yyyy-MM', new Date());
    });

    const formattedMonth = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate]);

    const { data: calendarData, isLoading } = useCarCalendar(carId, formattedMonth);

    const calendar = useMemo<CarAvailabilityCalendar | null>(() => {
        if (calendarData) return calendarData;

        if (initialCalendar.month === formattedMonth) {
            return initialCalendar;
        }

        return null;
    }, [calendarData, initialCalendar, formattedMonth]);

    const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
    const previousMonth = () => setCurrentDate(prev => subMonths(prev, 1));

    const isPast = useMemo(() => {
        const today = new Date();
        return currentDate.getFullYear() <= today.getFullYear() && currentDate.getMonth() <= today.getMonth();
    }, [currentDate]);

    const isMax = useMemo(() => {
        const maxDate = addMonths(new Date(), 3);
        return currentDate.getFullYear() >= maxDate.getFullYear() && currentDate.getMonth() >= maxDate.getMonth();
    }, [currentDate]);

    if (calendar?.carBlocked) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground border rounded-lg p-4 bg-muted/20">
                <MapPin className="h-4 w-4" />
                <span>{calendar.blockReason || 'Currently unavailable'}</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span>Booked</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={previousMonth}
                        disabled={isPast || isLoading}
                        title={isPast ? "Past months are not available" : ""}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={nextMonth}
                        disabled={isMax || isLoading}
                        title={isMax ? "Viewing the maximum available range" : ""}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isMax && (
                <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 mt-1">
                    Calendar is limited to the current month + 3 months ahead.
                </p>
            )}

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-lg">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                )}

                <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-1">
                            {d}
                        </div>
                    ))}

                    {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {calendar ? (
                        calendar.days.map((day: DayAvailability, index: number) => (
                            <div
                                key={index}
                                className={cn(
                                    'aspect-square rounded-md flex items-center justify-center text-[10px] sm:text-xs transition-colors',
                                    day.status === 'Available'
                                        ? 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20'
                                        : 'bg-red-500/10 text-red-700 dark:text-red-400'
                                )}
                                title={`${day.date}: ${day.status}`}
                            >
                                {new Date(day.date).getDate()}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-7 py-8 text-center text-xs text-muted-foreground">
                            {!isLoading && "Availability data not available for this month"}
                        </div>
                    )}
                </div>
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

