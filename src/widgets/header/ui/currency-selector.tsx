'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useCurrency } from '@/entities/currency';
import { CURRENCIES, getCurrencyByCode } from '@/entities/currency';
import { cn } from '@/shared/lib';

export function CurrencySelector() {
    const { currency, setCurrency, isLoading } = useCurrency();
    const currentCurrency = getCurrencyByCode(currency);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="h-9 gap-1 px-2 dark:hover:bg-transparent dark:hover:text-white"
                    aria-label={`Currency: ${currentCurrency.code}`}
                >
                    <span className="min-w-5 text-center text-sm font-semibold" aria-hidden="true">
                        {currentCurrency.symbol}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium" aria-hidden="true">
                        {currentCurrency.code}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {CURRENCIES.map((curr) => (
                    <DropdownMenuItem
                        key={curr.code}
                        onClick={() => setCurrency(curr.code)}
                        className={cn(
                            'flex items-center justify-between cursor-pointer',
                            currency === curr.code && 'bg-slate-100 dark:bg-slate-800'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{curr.code}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{curr.name}</span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {curr.symbol}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
