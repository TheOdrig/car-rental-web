'use client';

import { BarChart3, Car, CheckCircle, XCircle, DollarSign, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin';
import { formatCurrency } from '@/lib/utils/format';
import type { CustomerStatistics } from '@/types';

interface CustomerStatisticsCardProps {
    statistics: CustomerStatistics;
}

export function CustomerStatisticsCard({ statistics }: CustomerStatisticsCardProps) {
    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
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
                    <StatCard
                        label="Total Spent"
                        value={formatCurrency(statistics.totalSpent, 'USD')}
                        icon={DollarSign}
                        className="p-3"
                    />
                    <StatCard
                        label="Avg. Duration"
                        value={`${statistics.averageRentalDuration.toFixed(1)} days`}
                        icon={Clock}
                        className="p-3"
                    />
                    <StatCard
                        label="Damage Reports"
                        value={statistics.totalDamageReports}
                        icon={AlertTriangle}
                        className="p-3"
                    />
                    <StatCard
                        label="Damage Cost"
                        value={formatCurrency(statistics.totalDamageCost, 'USD')}
                        icon={DollarSign}
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
            </CardContent>
        </Card>
    );
}
