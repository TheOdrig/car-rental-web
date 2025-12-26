'use client';

import { CreditCard, Trash2, Check, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PaymentMethod, CardType } from '@/types/payment';

interface PaymentCardProps {
    method: PaymentMethod;
    onSetDefault?: (id: string) => void;
    onDelete?: (id: string) => void;
    className?: string;
}

const CARD_ICONS: Record<CardType, { color: string; name: string }> = {
    visa: { color: 'text-blue-600', name: 'Visa' },
    mastercard: { color: 'text-orange-500', name: 'Mastercard' },
    amex: { color: 'text-blue-400', name: 'Amex' },
    discover: { color: 'text-orange-600', name: 'Discover' },
    unknown: { color: 'text-muted-foreground', name: 'Card' },
};

export function PaymentCard({
    method,
    onSetDefault,
    onDelete,
    className,
}: PaymentCardProps) {
    const cardInfo = CARD_ICONS[method.cardType] || CARD_ICONS.unknown;

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors',
                method.isDefault && 'border-primary bg-primary/5',
                className
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn('rounded-lg bg-muted p-3', cardInfo.color)}>
                    <CreditCard className="h-6 w-6" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">
                            {cardInfo.name} •••• {method.last4}
                        </p>
                        {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                                Default
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth.toString().padStart(2, '0')}/
                        {method.expiryYear.toString().slice(-2)}
                    </p>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {!method.isDefault && (
                        <DropdownMenuItem onClick={() => onSetDefault?.(method.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Set as default
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        onClick={() => onDelete?.(method.id)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete card
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
