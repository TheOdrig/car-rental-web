'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Label } from '@/shared/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
    findRentalDateIssue,
    getEndDateRange,
    isEndDateDisabled,
    isStartDateDisabled,
    rentalLengthInDays,
} from '@/entities/rental';
import { cn, formatCurrencyWithDecimals } from '@/shared/lib';
import { toast } from 'sonner';
import type { Car as CarType } from '@/entities/car';

function formatPrice(price: number, currency: string): string {
    return formatCurrencyWithDecimals(price, currency || 'USD');
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
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please select both start and end dates');
            return;
        }

        const params = new URLSearchParams();
        params.append('carId', car.id.toString());
        params.append('startDate', format(startDate!, 'yyyy-MM-dd'));
        params.append('endDate', format(endDate!, 'yyyy-MM-dd'));
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
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{car.brand} {car.model}</p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {formatPrice(car.price, car.currencyType)}/day
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'h-12 justify-start text-left font-normal',
                                    'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
                                    !startDate && 'text-muted-foreground dark:text-slate-400',
                                    errors.startDate && 'border-destructive'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, 'PPP') : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                    setStartDate(date);
                                    if (errors.startDate) {
                                        setErrors(prev => ({ ...prev, startDate: '' }));
                                    }
                                    if (date && endDate) {
                                        const range = getEndDateRange(date);
                                        if (endDate < range.min || endDate > range.max) {
                                            setEndDate(undefined);
                                        }
                                    }
                                }}
                                disabled={(date) => isStartDateDisabled(date)}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.startDate && (
                        <p className="text-xs text-destructive" role="alert">{errors.startDate}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label>End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'h-12 justify-start text-left font-normal',
                                    'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
                                    !endDate && 'text-muted-foreground dark:text-slate-400',
                                    errors.endDate && 'border-destructive'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, 'PPP') : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                    setEndDate(date);
                                    if (errors.endDate) {
                                        setErrors(prev => ({ ...prev, endDate: '' }));
                                    }
                                }}
                                disabled={(date) => isEndDateDisabled(date, startDate)}
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
