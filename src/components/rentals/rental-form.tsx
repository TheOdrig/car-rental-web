'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, Loader2, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateRental } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Car as CarType } from '@/types';

function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

interface RentalFormProps {
    car: CarType;
    onSuccess?: () => void;
    className?: string;
}

type PaymentMethod = 'online' | 'cash';

export function RentalForm({ car, onSuccess, className }: RentalFormProps) {
    const router = useRouter();
    const createRentalMutation = useCreateRental();

    const today = startOfDay(new Date());
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!startDate) {
            newErrors.startDate = 'Start date is required';
        } else if (isBefore(startDate, today)) {
            newErrors.startDate = 'Start date cannot be in the past';
        }

        if (!endDate) {
            newErrors.endDate = 'End date is required';
        } else if (startDate && isBefore(endDate, startDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please select both start and end dates');
            return;
        }

        if (paymentMethod === 'online') {
            const startStr = format(startDate!, 'yyyy-MM-dd');
            const endStr = format(endDate!, 'yyyy-MM-dd');

            const params = new URLSearchParams();
            params.append('carId', car.id.toString());
            params.append('startDate', startStr);
            params.append('endDate', endStr);

            const url = `/checkout?${params.toString()}`;
            router.push(url);
            return;
        }

        try {
            await createRentalMutation.mutateAsync({
                carId: car.id,
                startDate: format(startDate!, 'yyyy-MM-dd'),
                endDate: format(endDate!, 'yyyy-MM-dd'),
            });

            onSuccess?.();
            router.push('/rentals');
        } catch {
            setErrors({
                form: 'Failed to create rental request. Please try again.',
            });
        }
    };

    const calculateDays = (): number => {
        if (!startDate || !endDate) return 0;
        const diffTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const calculateTotal = (): number => {
        return calculateDays() * car.price;
    };

    const days = calculateDays();
    const total = calculateTotal();

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
            {errors.form && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {errors.form}
                </div>
            )}

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
                                disabled={createRentalMutation.isPending}
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
                                    if (date && endDate && isBefore(endDate, date)) {
                                        setEndDate(addDays(date, 1));
                                    }
                                }}
                                disabled={(date) => isBefore(date, today)}
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
                                disabled={createRentalMutation.isPending}
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
                                disabled={(date) => {
                                    if (isBefore(date, today)) return true;
                                    return !!(startDate && isBefore(date, startDate));
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.endDate && (
                        <p className="text-xs text-destructive" role="alert">{errors.endDate}</p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Payment Method</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={cn(
                            'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all cursor-pointer',
                            paymentMethod === 'online'
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-muted-foreground/50'
                        )}
                    >
                        <CreditCard className={cn(
                            'h-5 w-5 mt-0.5 shrink-0',
                            paymentMethod === 'online' ? 'text-primary' : 'text-muted-foreground'
                        )} />
                        <div>
                            <p className="font-medium">Pay Now</p>
                            <p className="text-xs text-muted-foreground">
                                Credit/Debit Card • Instant confirmation
                            </p>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={cn(
                            'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all cursor-pointer',
                            paymentMethod === 'cash'
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-muted-foreground/50'
                        )}
                    >
                        <Banknote className={cn(
                            'h-5 w-5 mt-0.5 shrink-0',
                            paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'
                        )} />
                        <div>
                            <p className="font-medium">Pay at Pickup</p>
                            <p className="text-xs text-muted-foreground">
                                Cash/Card • Requires approval
                            </p>
                        </div>
                    </button>
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
                        <span>Estimated Total</span>
                        <span>{formatPrice(total, car.currencyType)}</span>
                    </div>
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-12 font-bold"
                disabled={createRentalMutation.isPending}
            >
                {createRentalMutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {paymentMethod === 'online' ? 'Redirecting...' : 'Submitting Request...'}
                    </>
                ) : paymentMethod === 'online' ? (
                    <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to Payment
                    </>
                ) : (
                    'Request Rental'
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                {paymentMethod === 'online'
                    ? 'You will be redirected to secure payment page.'
                    : 'Your request will be reviewed and confirmed by our team.'}
            </p>
        </form>
    );
}

