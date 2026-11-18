'use client';

import { Check, Shield, XCircle } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib';

const INSURANCE_ITEMS = [
    { name: 'Basic Coverage', included: true },
    { name: 'Collision Damage Waiver', included: true },
    { name: 'Theft Protection', included: true },
    { name: 'Premium Roadside Assistance', included: false },
    { name: 'Personal Injury Protection', included: false },
];

export function InsuranceCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                    Insurance & Protection
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="grid gap-2 sm:grid-cols-2">
                    {INSURANCE_ITEMS.map((item) => (
                        <li
                            key={item.name}
                            className={cn(
                                'flex items-center gap-2 rounded-lg p-2',
                                item.included
                                    ? 'text-slate-900 dark:text-slate-100'
                                    : 'text-slate-400 dark:text-slate-500'
                            )}
                        >
                            {item.included ? (
                                <Check className="h-4 w-4 shrink-0 text-green-500 dark:text-green-400" aria-hidden="true" />
                            ) : (
                                <XCircle className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                            )}
                            <span className="text-sm">{item.name}</span>
                            {item.included ? (
                                <Badge
                                    variant="secondary"
                                    className="ml-auto border border-green-200 bg-green-100 text-xs text-green-700 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300"
                                >
                                    Included
                                </Badge>
                            ) : (
                                <span className="sr-only">Not included</span>
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
