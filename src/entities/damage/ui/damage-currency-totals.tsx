import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatCurrencyWithDecimals } from '@/shared/lib';
import type { DamageStatistics } from '../model/types';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';

interface DamageCurrencyTotalsProps {
    totals: DamageStatistics['byCurrency'];
}

export function DamageCurrencyTotals({ totals }: DamageCurrencyTotalsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Costs by Currency</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Assessed reports only; amounts in different currencies are never summed together.
                </p>
            </CardHeader>
            <CardContent>
                {totals.length === 0 ? (
                    <p className="text-sm text-muted-foreground" data-testid="damage-currency-empty">
                        No assessed damage reports yet.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {totals.map((entry) => {
                            const currency = entry.currency ?? DEFAULT_CURRENCY;
                            return (
                                <div
                                    key={currency}
                                    className="rounded-lg border p-4 space-y-2"
                                    data-testid={`damage-currency-${currency}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">{currency}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {entry.assessedCount ?? 0} assessed
                                        </span>
                                    </div>
                                    <dl className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Repair cost</dt>
                                            <dd className="font-medium">
                                                {formatCurrencyWithDecimals(entry.totalRepairCost ?? 0, currency)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Customer liability</dt>
                                            <dd className="font-medium">
                                                {formatCurrencyWithDecimals(entry.totalCustomerLiability ?? 0, currency)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Average repair</dt>
                                            <dd className="font-medium">
                                                {formatCurrencyWithDecimals(entry.averageRepairCost ?? 0, currency)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
