'use client';

import React, { type ReactNode, useState, useMemo } from 'react';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import {
    Fuel, Users, Settings2, Calendar, Gauge, Palette,
    MapPin, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, parse } from 'date-fns';
import { cn, formatDate, formatNumber } from '@/shared/lib';
import { friendlyUnavailableReason, getCarUnavailableMessage } from '../lib/status-messages';
import { AVAILABILITY_STATUS_LABELS, CAR_STATUS, DAY_AVAILABILITY } from '../model/status-labels';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { type Car, type CarAvailabilityCalendar, type DayAvailability } from '../model/types';
import { useCurrency, mapCurrency } from '@/entities/currency/@x/car';

export interface CarDetailProps extends React.HTMLAttributes<HTMLDivElement> {
    car: Car;
    calendar?: CarAvailabilityCalendar | null;
    isCalendarLoading?: boolean;
    onMonthChange?: (month: string) => void;
    actionSlot?: ReactNode;
}

export interface CarDetailSkeletonProps {
    className?: string;
}


export function CarDetail({ car, calendar, isCalendarLoading, onMonthChange, actionSlot, className }: CarDetailProps) {

    const { format: formatPrice } = useCurrency();
    const sourceCurrency = mapCurrency(car.currencyType);

    const specs = [
        { icon: Fuel, label: 'Fuel', value: car.fuelType },
        { icon: Settings2, label: 'Transmission', value: car.transmissionType },
        { icon: Users, label: 'Seats', value: car.seats },
        { icon: Gauge, label: 'Mileage', value: car.kilometer ? `${formatNumber(car.kilometer)} km` : null },
        { icon: Palette, label: 'Color', value: car.color },
        { icon: Calendar, label: 'Year', value: car.productionYear },
    ].filter(spec => spec.value);

    const isAvailable = car.carStatusType === CAR_STATUS.AVAILABLE;

    return (
        <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start', className)}>
            <div className="relative aspect-video overflow-hidden rounded-xl lg:col-start-1 lg:row-start-1">
                <DynamicImage
                    src={car.imageUrl ?? '/images/car-placeholder.svg'}
                    alt={`${car.brand} ${car.model} ${car.productionYear}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    fetchPriority="high"
                    className="object-cover"
                />
            </div>

            {calendar && (
                <Card className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AvailabilityCalendar
                            calendar={calendar}
                            isLoading={isCalendarLoading}
                            onMonthChange={onMonthChange}
                        />
                    </CardContent>
                </Card>
            )}

            <div className="order-2 min-w-0 space-y-6 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
                <div>
                    <h1 className="text-3xl font-bold">
                        {car.brand} {car.model}
                    </h1>
                    <p className="text-muted-foreground mt-1">{car.productionYear}</p>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
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

                {actionSlot}

                {!isAvailable && !actionSlot && (
                    <Card className="border-warning-subtle-foreground/30 bg-warning-subtle">
                        <CardContent className="py-4">
                            <p className="text-center text-warning-subtle-foreground">
                                {getCarUnavailableMessage(car.carStatusType)}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

interface AvailabilityCalendarProps {
    calendar: CarAvailabilityCalendar | null;
    isLoading?: boolean;
    onMonthChange?: (month: string) => void;
}

function AvailabilityCalendar({ calendar, isLoading = false, onMonthChange }: AvailabilityCalendarProps) {
    const [currentDate, setCurrentDate] = useState(() => {
        if (calendar?.month) {
            return parse(calendar.month, 'yyyy-MM', new Date());
        }
        return new Date();
    });


    const nextMonth = () => {
        const newDate = addMonths(currentDate, 1);
        setCurrentDate(newDate);
        onMonthChange?.(format(newDate, 'yyyy-MM'));
    };

    const previousMonth = () => {
        const newDate = subMonths(currentDate, 1);
        setCurrentDate(newDate);
        onMonthChange?.(format(newDate, 'yyyy-MM'));
    };

    const todayKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }, []);

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
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{friendlyUnavailableReason(calendar.blockReason)}</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-foreground">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-success" />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-destructive" />
                            <span>Booked</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                            <span>Past</span>
                        </div>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 pl-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Previous month"
                        onClick={previousMonth}
                        disabled={isPast || isLoading}
                        title={isPast ? "Past months are not available" : undefined}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Next month"
                        onClick={nextMonth}
                        disabled={isMax || isLoading}
                        title={isMax ? "Viewing the maximum available range" : undefined}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isMax && (
                <p className="text-[10px] text-warning-subtle-foreground bg-warning-subtle px-2 py-1 rounded border border-warning-subtle-foreground/30 mt-1">
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
                        calendar.days.map((day: DayAvailability, index: number) => {
                            const past = day.date < todayKey;
                            const label = past ? 'Past' : AVAILABILITY_STATUS_LABELS[day.status];
                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        'aspect-square rounded-md flex items-center justify-center text-[10px] sm:text-xs transition-colors',
                                        past
                                            ? 'bg-muted text-muted-foreground'
                                            : day.status === DAY_AVAILABILITY.AVAILABLE
                                                ? 'bg-success-subtle text-success-subtle-foreground hover:bg-success-subtle'
                                                : 'bg-danger-subtle text-danger-subtle-foreground'
                                    )}
                                    title={`${formatDate(day.date)}: ${label}`}
                                >
                                    {Number(day.date.slice(8, 10))}
                                </div>
                            );
                        })
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