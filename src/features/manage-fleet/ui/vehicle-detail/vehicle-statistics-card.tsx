'use client';

import { BarChart3, Car, DollarSign, Clock, AlertTriangle, Percent, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from '@/shared/ui/stat-card';
import { formatCurrency } from '@/shared/lib';
import type { VehicleStatistics } from '@/entities/car';

interface VehicleStatisticsCardProps {
    statistics: VehicleStatistics;
    currency: string;
}

export function VehicleStatisticsCard({ statistics, currency }: VehicleStatisticsCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                    Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        label="Total Rentals"
                        value={statistics.totalRentals}
                        icon={Car}
                        className="p-3"
                    />
                    <StatCard
                        label="Total Revenue"
                        value={formatCurrency(statistics.totalRevenue, currency)}
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
                        label="Occupancy Rate"
                        value={`${(statistics.occupancyRate * 100).toFixed(0)}%`}
                        icon={Percent}
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
                        value={formatCurrency(statistics.totalDamageCost, currency)}
                        icon={DollarSign}
                        className="p-3"
                    />
                    <StatCard
                        label="Avg. Rating"
                        value={statistics.averageRating ? statistics.averageRating.toFixed(1) : 'N/A'}
                        icon={Star}
                        className="p-3"
                    />
                </div>
            </CardContent>
        </Card>
    );
}