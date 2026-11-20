'use client';

import { BarChart3, Car, CheckCircle, XCircle, DollarSign, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from '@/shared/ui/stat-card';
import { formatCurrencyWithDecimals } from '@/shared/lib';
import type { CustomerStatistics } from '@/entities/user';

interface CustomerStatisticsCardProps {
    statistics: CustomerStatistics;
}

export function CustomerStatisticsCard({ statistics }: CustomerStatisticsCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                    Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <StatCard
                        label="Total Rentals"
                        value={statistics.totalRentals}
                        icon={Car}
                        className="p-3"
                    />
                    <StatCard
                        label="Completed"
                        value={statistics.completedRentals}
                        icon={CheckCircle}
                        className="p-3"
                    />
                    <StatCard
                        label="Cancelled"
                        value={statistics.cancelledRentals}
                        icon={XCircle}
                        className="p-3"
                    />
                    <StatCard
                        label="Active"
                        value={statistics.activeRentals}
                        icon={Car}
                        className="p-3"
                    />
                    {statistics.averageRentalDuration > 0 && (
                        <StatCard
                            label="Avg. Duration"
                            value={`${statistics.averageRentalDuration.toFixed(1)} days`}
                            icon={Clock}
                            className="p-3"
                        />
                    )}
                    <StatCard
                        label="Damage Reports"
                        value={statistics.totalDamageReports}
                        icon={AlertTriangle}
                        className="p-3"
                    />
                    <StatCard
                        label="Late Returns"
                        value={statistics.lateReturns}
                        icon={Clock}
                        className="p-3"
                    />
                    <StatCard
                        label="Customer Since"
                        value={`${statistics.customerSinceDays} days`}
                        icon={Calendar}
                        className="p-3"
                    />
                </div>
                <div className="mt-4" data-testid="spent-by-currency">
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <DollarSign className="h-4 w-4" />
                        Net Paid by Currency
                    </p>
                    {statistics.spentByCurrency.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No completed rentals yet.</p>
                    ) : (
                        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {statistics.spentByCurrency.map((entry) => (
                                <li key={entry.currency}>
                                    <StatCard
                                        label={`${entry.currency} (${entry.rentalCount} ${entry.rentalCount === 1 ? 'rental' : 'rentals'})`}
                                        value={formatCurrencyWithDecimals(entry.totalSpent, entry.currency)}
                                        className="p-3"
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="mt-4" data-testid="damage-cost-by-currency">
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <DollarSign className="h-4 w-4" />
                        Damage Cost by Currency
                    </p>
                    {statistics.damageCostByCurrency.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No assessed damage costs.</p>
                    ) : (
                        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {statistics.damageCostByCurrency.map((entry) => (
                                <li key={entry.currency}>
                                    <StatCard
                                        label={`${entry.currency} (${entry.assessedCount ?? 0} assessed)`}
                                        value={formatCurrencyWithDecimals(entry.totalCustomerLiability ?? 0, entry.currency ?? 'USD')}
                                        className="p-3"
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}