export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatTrend(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
}

export function validatePickupForm(data: {
    idVerified: boolean;
    conditionInspected: boolean;
}): boolean {
    return data.idVerified && data.conditionInspected;
}

export function validateRejectForm(reason: string): boolean {
    return reason.trim().length > 0;
}

export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

import { MonthlyRevenue, RevenueDataPoint } from '@/types/admin';

export function processRevenueData(
    data: MonthlyRevenue[],
    period: 'last6months' | 'lastyear' = 'last6months'
): RevenueDataPoint[] {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => {
        if (a.month.year !== b.month.year) {
            return b.month.year - a.month.year;
        }
        return b.month.monthValue - a.month.monthValue;
    });

    const limit = period === 'last6months' ? 6 : 12;
    const filtered = sorted.slice(0, limit);

    return filtered
        .sort((a, b) => {
            if (a.month.year !== b.month.year) {
                return a.month.year - b.month.year;
            }
            return a.month.monthValue - b.month.monthValue;
        })
        .map((item, index, array) => ({
            month: item.month.month,
            revenue: item.revenue,
            isCurrent: index === array.length - 1,
        }));
}

export function calculateFleetPercentages(data: {
    totalCars: number;
    availableCars: number;
    rentedCars: number;
    maintenanceCars: number;
    damagedCars: number;
}): {
    available: number;
    rented: number;
    maintenance: number;
    damaged: number;
} {
    const { totalCars, availableCars, rentedCars, maintenanceCars, damagedCars } = data;

    if (totalCars === 0) {
        return { available: 0, rented: 0, maintenance: 0, damaged: 0 };
    }

    return {
        available: Math.round((availableCars / totalCars) * 100),
        rented: Math.round((rentedCars / totalCars) * 100),
        maintenance: Math.round((maintenanceCars / totalCars) * 100),
        damaged: Math.round((damagedCars / totalCars) * 100),
    };
}
