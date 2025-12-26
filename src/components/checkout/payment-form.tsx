'use client';

import { useState, type ChangeEvent } from 'react';
import { CreditCard, HelpCircle } from 'lucide-react';
import { Control, FieldErrors, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CheckoutFormSchema } from '@/lib/validations/checkout';
import {
    formatCardNumber,
    formatExpiryDate,
    formatCVC,
    detectCardType,
} from '@/lib/utils/checkout-utils';
import type { CardType } from '@/types';

interface PaymentFormProps {
    control: Control<CheckoutFormSchema>;
    errors: FieldErrors<CheckoutFormSchema>;
}

function CardTypeIcon({ cardType }: { cardType: CardType }) {
    const getCardColor = () => {
        switch (cardType) {
            case 'visa':
                return 'text-blue-600';
            case 'mastercard':
                return 'text-orange-500';
            case 'amex':
                return 'text-blue-500';
            case 'discover':
                return 'text-orange-600';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <CreditCard
            className={cn('h-5 w-5 transition-colors', getCardColor())}
            aria-label={cardType !== 'unknown' ? `${cardType} card` : 'Credit card'}
        />
    );
}

export function PaymentForm({ control, errors }: PaymentFormProps) {
    const [cardType, setCardType] = useState<CardType>('unknown');

    const handleCardNumberChange = (
        value: string,
        onChange: (value: string) => void
    ) => {
        const formatted = formatCardNumber(value);
        onChange(formatted);
        setCardType(detectCardType(formatted));
    };

    const handleExpiryChange = (
        value: string,
        onChange: (value: string) => void
    ) => {
        const formatted = formatExpiryDate(value);
        onChange(formatted);
    };

    const handleCVCChange = (
        value: string,
        onChange: (value: string) => void
    ) => {
        const formatted = formatCVC(value);
        onChange(formatted);
    };

    return (
        <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    2
                </span>
                <h2 className="text-xl font-bold text-foreground">Payment Method</h2>
                <div className="ml-auto">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-sm font-medium">
                        Card Number
                    </Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CardTypeIcon cardType={cardType} />
                        </span>
                        <Controller
                            name="cardNumber"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="cardNumber"
                                    placeholder="0000 0000 0000 0000"
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    maxLength={19}
                                    className={cn(
                                        'h-12 pl-10',
                                        errors.cardNumber && 'border-destructive focus-visible:ring-destructive'
                                    )}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleCardNumberChange(e.target.value, field.onChange)
                                    }
                                />
                            )}
                        />
                    </div>
                    {errors.cardNumber && (
                        <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-sm font-medium">
                            Expiry Date
                        </Label>
                        <Controller
                            name="expiryDate"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="expiryDate"
                                    placeholder="MM/YY"
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                    maxLength={5}
                                    className={cn(
                                        'h-12',
                                        errors.expiryDate && 'border-destructive focus-visible:ring-destructive'
                                    )}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleExpiryChange(e.target.value, field.onChange)
                                    }
                                />
                            )}
                        />
                        {errors.expiryDate && (
                            <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cvc" className="text-sm font-medium">
                            CVC / CVV
                        </Label>
                        <div className="relative">
                            <Controller
                                name="cvc"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="cvc"
                                        placeholder={cardType === 'amex' ? '1234' : '123'}
                                        inputMode="numeric"
                                        autoComplete="cc-csc"
                                        maxLength={cardType === 'amex' ? 4 : 3}
                                        className={cn(
                                            'h-12 pr-10',
                                            errors.cvc && 'border-destructive focus-visible:ring-destructive'
                                        )}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            handleCVCChange(e.target.value, field.onChange)
                                        }
                                    />
                                )}
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-help">
                                            <HelpCircle className="h-4 w-4" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {cardType === 'amex'
                                                ? '4 digits on front of card'
                                                : '3 digits on back of card'}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {errors.cvc && (
                            <p className="text-sm text-destructive">{errors.cvc.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cardholderName" className="text-sm font-medium">
                        Cardholder Name
                    </Label>
                    <Controller
                        name="cardholderName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="cardholderName"
                                placeholder="Name as on card"
                                autoComplete="cc-name"
                                className={cn(
                                    'h-12',
                                    errors.cardholderName && 'border-destructive focus-visible:ring-destructive'
                                )}
                            />
                        )}
                    />
                    {errors.cardholderName && (
                        <p className="text-sm text-destructive">{errors.cardholderName.message}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
