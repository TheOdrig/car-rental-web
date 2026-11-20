'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { startOfMonth } from 'date-fns';
import { useRouter } from 'next/navigation';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Label } from '@/shared/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
    addCalendarDays,
    findBookedDate,
    findRentalDateIssue,
    getEndDateRange,
    isEndDateDisabled,
    isStartDateDisabled,
    rentalLengthInDays,
    toDateInputValue,
    CAR_BOOKED_MESSAGE,
} from '@/entities/rental';
import { cn, formatCurrency, formatDate } from '@/shared/lib';
import { toast } from 'sonner';
import { useBookedDates } from '@/entities/car';
import type { Car as CarType } from '@/entities/car';

function formatPrice(price: number, currency: string): string {
    return formatCurrency(price, currency || 'USD');
}

function monthKey(date: Date): string {
    return toDateInputValue(date).slice(0, 7);
}

function firstBookedAfter(start: Date | undefined, booked: ReadonlySet<string>): Date | null {
    if (!start || booked.size === 0) return null;
    const horizon = addCalendarDays(start, 40);
    for (let day = addCalendarDays(start, 1); day <= horizon; day = addCalendarDays(day, 1)) {
        if (booked.has(toDateInputValue(day))) return day;
    }
    return null;
}

interface RentalFormProps {
    car: CarType;
    className?: string;
}

export function RentalForm({ car, className }: RentalFormProps) {
    const router = useRouter();

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);
    const [months, setMonths] = useState<string[]>(() => [monthKey(new Date())]);
    const { booked } = useBookedDates(car.id, months);
    const firstMonth = useMemo(() => startOfMonth(new Date()), []);

    const watchMonth = (date: Date) => {
        if (date < firstMonth) return;
        const key = monthKey(date);
        setMonths((current) => (current.includes(key) ? current : [...current, key]));
    };

    const firstBooked = useMemo(() => firstBookedAfter(startDate, booked), [startDate, booked]);
    const isBooked = (date: Date) => booked.has(toDateInputValue(date));

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!endDate) {
            newErrors.endDate = 'End date is required';
        }

        if (startDate && endDate) {
            const issue = findRentalDateIssue(startDate, endDate);
            if (issue) {
                newErrors[issue.field] = issue.message;
            } else if (findBookedDate(startDate, endDate, booked)) {
                newErrors.range = CAR_BOOKED_MESSAGE;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error(errors.range || 'Please check the dates you selected');
            return;
        }

        const params = new URLSearchParams();
        params.append('carId', car.id.toString());
        params.append('startDate', toDateInputValue(startDate!));
        params.append('endDate', toDateInputValue(endDate!));
        router.push(`/checkout?${params.toString()}`);
    };

    const calculateDays = (): number => {
        if (!startDate || !endDate) return 0;
        return rentalLengthInDays(startDate, endDate);
    };

    const calculateTotal = (): number => {
        return calculateDays() * car.price;
    };

    const days = calculateDays();
    const total = calculateTotal();

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
            <div className="p-4 rounded-lg bg-muted border border-border">
                <div>
                    <p className="font-semibold text-foreground">{car.brand} {car.model}</p>
                    <p className="text-sm font-medium text-muted-foreground">
                        {formatPrice(car.price, car.currencyType)}/day
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label>Start Date</Label>
                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'h-12 justify-start text-left font-normal',
                                    'dark:bg-input/30 dark:hover:bg-input/50',
                                    !startDate && 'text-muted-foreground',
                                    errors.startDate && 'border-destructive'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? formatDate(startDate) : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                startMonth={firstMonth}
                                onSelect={(date) => {
                                    setStartDate(date);
                                    if (date) {
                                        setStartOpen(false);
                                        watchMonth(date);
                                        watchMonth(addCalendarDays(date, 30));
                                    }
                                    setErrors(prev => ({ ...prev, startDate: '', range: '' }));
                                    if (date && endDate) {
                                        const range = getEndDateRange(date);
                                        if (endDate < range.min || endDate > range.max) {
                                            setEndDate(undefined);
                                        }
                                    }
                                }}
                                disabled={(date) => isStartDateDisabled(date) || isBooked(date)}
                                onMonthChange={watchMonth}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.startDate && (
                        <p className="text-xs text-destructive" role="alert">{errors.startDate}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label>End Date</Label>
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'h-12 justify-start text-left font-normal',
                                    'dark:bg-input/30 dark:hover:bg-input/50',
                                    !endDate && 'text-muted-foreground',
                                    errors.endDate && 'border-destructive'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? formatDate(endDate) : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                startMonth={firstMonth}
                                onSelect={(date) => {
                                    setEndDate(date);
                                    if (date) setEndOpen(false);
                                    setErrors(prev => ({ ...prev, endDate: '', range: '' }));
                                }}
                                disabled={(date) =>
                                    isEndDateDisabled(date, startDate) || isBooked(date) || (firstBooked !== null && date > firstBooked)
                                }
                                defaultMonth={startDate}
                                onMonthChange={watchMonth}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.endDate && (
                        <p className="text-xs text-destructive" role="alert">{errors.endDate}</p>
                    )}
                </div>
            </div>

            {days > 0 && (
                <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Daily rate</span>
                        <span>{formatPrice(car.price, car.currencyType)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{days} {days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Estimated total</span>
                        <span>{formatPrice(total, car.currencyType)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Estimated from the daily rate, final price on review. Weekend and demand pricing may apply.
                    </p>
                </div>
            )}

            {errors.range && (
                <p className="text-sm text-destructive" role="alert">{errors.range}</p>
            )}

            <Button type="submit" className="w-full h-12 font-bold">
                Request Rental
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                You review the request next. An administrator approves it, and payment comes after approval.
            </p>
        </form>
    );
}
