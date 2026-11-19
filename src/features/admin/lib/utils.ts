import { isValid } from 'date-fns';
import type { MonthlyRevenue, RevenueDataPoint } from '../model/types';

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
    if (!isValid(d)) return 'N/A';
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) return 'N/A';
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseYearMonth(value: string): { year: number; monthValue: number } {
    const [year, month] = value.split('-').map(Number);
    return { year: year || 0, monthValue: month || 0 };
}

export function processRevenueData(
    data: MonthlyRevenue[],
    period: 'last6months' | 'lastyear' = 'last6months',
    currency?: MonthlyRevenue['currency']
): RevenueDataPoint[] {
    if (!data || data.length === 0) return [];

    const scoped = currency ? data.filter((item) => item.currency === currency) : data;

    const sorted = scoped
        .map((item) => ({ item, ...parseYearMonth(item.month) }))
        .sort((a, b) => b.year - a.year || b.monthValue - a.monthValue);

    const limit = period === 'last6months' ? 6 : 12;

    return sorted
        .slice(0, limit)
        .reverse()
        .map(({ item, monthValue }, index, array) => ({
            month: MONTH_LABELS[monthValue - 1] ?? item.month,
            revenue: item.revenue,
            isCurrent: index === array.length - 1,
        }));
}

export function revenueCurrencies(analytics: {
    breakdownByCurrency?: { currency: MonthlyRevenue['currency'] }[];
    monthlyRevenue?: MonthlyRevenue[];
} | undefined): MonthlyRevenue['currency'][] {
    if (!analytics) return [];
    const seen = new Set<MonthlyRevenue['currency']>();
    for (const item of analytics.breakdownByCurrency ?? []) seen.add(item.currency);
    for (const item of analytics.monthlyRevenue ?? []) seen.add(item.currency);
    return [...seen].sort();
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

export function getAlertStyles(type: 'critical' | 'warning' | 'info' | 'success') {
    const styles = {
        critical: {
            border: 'border-red-500',
            bg: 'bg-red-50 dark:bg-red-950/20',
            text: 'text-red-900 dark:text-red-100',
            iconColor: 'text-red-500',
        },
        warning: {
            border: 'border-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-950/20',
            text: 'text-amber-900 dark:text-amber-100',
            iconColor: 'text-amber-500',
        },
        info: {
            border: 'border-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-950/20',
            text: 'text-blue-900 dark:text-blue-100',
            iconColor: 'text-blue-500',
        },
        success: {
            border: 'border-green-500',
            bg: 'bg-green-50 dark:bg-green-950/20',
            text: 'text-green-900 dark:text-green-100',
            iconColor: 'text-green-500',
        },
    };

    return styles[type];
}