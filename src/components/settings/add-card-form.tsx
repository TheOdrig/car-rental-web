'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { CardType } from '@/types/payment';

const addCardSchema = z.object({
    cardNumber: z.string().min(16, 'Card number must be 16 digits').max(19),
    expiryMonth: z.string().min(1, 'Required').max(2),
    expiryYear: z.string().min(2, 'Required').max(4),
    cvc: z.string().min(3, 'CVC must be 3-4 digits').max(4),
    cardholderName: z.string().min(2, 'Name is required'),
    setAsDefault: z.boolean().optional(),
});

type AddCardFormData = z.infer<typeof addCardSchema>;

interface AddCardFormProps {
    onSubmit: (data: AddCardFormData) => Promise<void>;
    onCancel?: () => void;
    className?: string;
}

function detectCardType(number: string): CardType {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6011/.test(cleaned)) return 'discover';
    return 'unknown';
}

function formatCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').slice(0, 19);
}

const CARD_COLORS: Record<CardType, string> = {
    visa: 'text-blue-600',
    mastercard: 'text-orange-500',
    amex: 'text-blue-400',
    discover: 'text-orange-600',
    unknown: 'text-muted-foreground',
};

export function AddCardForm({ onSubmit, onCancel, className }: AddCardFormProps) {
    const [cardType, setCardType] = useState<CardType>('unknown');
    const [setAsDefault, setSetAsDefault] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AddCardFormData>({
        resolver: zodResolver(addCardSchema),
        defaultValues: {
            setAsDefault: false,
        },
    });

    const handleCardNumberChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatCardNumber(e.target.value);
            setValue('cardNumber', formatted);
            setCardType(detectCardType(formatted));
        },
        [setValue]
    );

    const handleFormSubmit = async (data: AddCardFormData) => {
        await onSubmit({ ...data, setAsDefault });
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className={cn('space-y-4', className)}
        >
            <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                    <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        {...register('cardNumber')}
                        onChange={handleCardNumberChange}
                        aria-invalid={!!errors.cardNumber}
                    />
                    <CreditCard
                        className={cn(
                            'absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2',
                            CARD_COLORS[cardType]
                        )}
                    />
                </div>
                {errors.cardNumber && (
                    <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Input
                        id="expiryMonth"
                        placeholder="MM"
                        maxLength={2}
                        {...register('expiryMonth')}
                        aria-invalid={!!errors.expiryMonth}
                    />
                    {errors.expiryMonth && (
                        <p className="text-sm text-destructive">{errors.expiryMonth.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Input
                        id="expiryYear"
                        placeholder="YY"
                        maxLength={2}
                        {...register('expiryYear')}
                        aria-invalid={!!errors.expiryYear}
                    />
                    {errors.expiryYear && (
                        <p className="text-sm text-destructive">{errors.expiryYear.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                        id="cvc"
                        placeholder="123"
                        maxLength={4}
                        {...register('cvc')}
                        aria-invalid={!!errors.cvc}
                    />
                    {errors.cvc && (
                        <p className="text-sm text-destructive">{errors.cvc.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    {...register('cardholderName')}
                    aria-invalid={!!errors.cardholderName}
                />
                {errors.cardholderName && (
                    <p className="text-sm text-destructive">{errors.cardholderName.message}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="setAsDefault"
                    checked={setAsDefault}
                    onCheckedChange={(checked) => setSetAsDefault(checked === true)}
                />
                <Label htmlFor="setAsDefault" className="text-sm font-normal">
                    Set as default payment method
                </Label>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="text-green-700 dark:text-green-300">
                    Your payment info is securely encrypted
                </span>
            </div>

            <div className="flex gap-3">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Card
                </Button>
            </div>
        </form>
    );
}

