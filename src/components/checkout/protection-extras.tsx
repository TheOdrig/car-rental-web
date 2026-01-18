'use client';

import { Shield, Navigation, Baby, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCurrencyWithDecimals } from '@/lib/utils/format';
import type { Addon } from '@/types';

interface ProtectionExtrasProps {
    addons: Addon[];
    selectedAddons: string[];
    onAddonChange: (addonId: string, selected: boolean) => void;
    rentalDays: number;
    currency?: string;
}

function getAddonIcon(iconName?: string) {
    const iconClass = 'h-5 w-5';
    switch (iconName) {
        case 'shield-check':
            return <Shield className={iconClass} />;
        case 'navigation':
            return <Navigation className={iconClass} />;
        case 'baby':
            return <Baby className={iconClass} />;
        case 'users':
            return <Users className={iconClass} />;
        default:
            return <Shield className={iconClass} />;
    }
}

export function ProtectionExtras({
    addons,
    selectedAddons,
    onAddonChange,
    rentalDays,
    currency = 'USD',
}: ProtectionExtrasProps) {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    3
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Protection & Extras</h2>
            </div>

            <div className="space-y-4">
                {addons.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    const totalCost = addon.pricePerDay * rentalDays;

                    return (
                        <label
                            key={addon.id}
                            className={cn(
                                'relative flex items-start p-4 rounded-xl border cursor-pointer transition-colors group',
                                isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            <div className="flex items-center h-6">
                                <Checkbox
                                    id={addon.id}
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                        onAddonChange(addon.id, checked === true)
                                    }
                                    className="h-5 w-5"
                                />
                            </div>

                            <div className="ml-4 flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'text-slate-500 dark:text-slate-400',
                                                isSelected && 'text-primary'
                                            )}
                                        >
                                            {getAddonIcon(addon.icon)}
                                        </span>
                                        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            {addon.name}
                                        </span>
                                        {addon.popular && (
                                            <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-base font-bold text-primary">
                                            +{formatCurrency(addon.pricePerDay, currency)}
                                            <span className="text-xs font-normal text-slate-600 dark:text-slate-400">
                                                /day
                                            </span>
                                        </span>
                                        {rentalDays > 1 && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                {formatCurrencyWithDecimals(totalCost, currency)} total
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {addon.description}
                                </p>
                            </div>
                        </label>
                    );
                })}
            </div>

            {addons.length === 0 && (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    <p>No additional options available for this rental.</p>
                </div>
            )}
        </section>
    );
}
