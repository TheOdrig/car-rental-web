'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { DamageSeverity, DamageCategory, DamageStatus } from '@/types';

const SEVERITY_OPTIONS: { value: DamageSeverity; label: string }[] = [
    { value: 'MINOR', label: 'Minor' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'MAJOR', label: 'Major' },
    { value: 'TOTAL_LOSS', label: 'Total Loss' },
];

const CATEGORY_OPTIONS: { value: DamageCategory; label: string }[] = [
    { value: 'SCRATCH', label: 'Scratch' },
    { value: 'DENT', label: 'Dent' },
    { value: 'GLASS_DAMAGE', label: 'Glass Damage' },
    { value: 'TIRE_DAMAGE', label: 'Tire Damage' },
    { value: 'INTERIOR_DAMAGE', label: 'Interior Damage' },
    { value: 'MECHANICAL_DAMAGE', label: 'Mechanical Damage' },
];

const STATUS_OPTIONS: { value: DamageStatus; label: string }[] = [
    { value: 'REPORTED', label: 'Reported' },
    { value: 'UNDER_ASSESSMENT', label: 'Under Assessment' },
    { value: 'ASSESSED', label: 'Assessed' },
    { value: 'CHARGED', label: 'Charged' },
    { value: 'DISPUTED', label: 'Disputed' },
    { value: 'RESOLVED', label: 'Resolved' },
];

const triggerClassName = "bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100";

const inputClassName = "bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100";

export function DamageFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            params.set('page', '0');
            router.push(`?${params.toString()}`);
        },
        [router, searchParams]
    );

    const clearFilters = useCallback(() => {
        router.push('?');
    }, [router]);

    const hasFilters =
        searchParams.has('severity') ||
        searchParams.has('category') ||
        searchParams.has('status') ||
        searchParams.has('startDate') ||
        searchParams.has('endDate');

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Select
                value={searchParams.get('severity') || 'all'}
                onValueChange={(value) => updateFilter('severity', value)}
            >
                <SelectTrigger className={`w-[140px] ${triggerClassName}`}>
                    <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    {SEVERITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={searchParams.get('category') || 'all'}
                onValueChange={(value) => updateFilter('category', value)}
            >
                <SelectTrigger className={`w-[160px] ${triggerClassName}`}>
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={searchParams.get('status') || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
            >
                <SelectTrigger className={`w-[160px] ${triggerClassName}`}>
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                type="date"
                placeholder="Start Date"
                value={searchParams.get('startDate') || ''}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className={`w-[150px] ${inputClassName}`}
            />

            <Input
                type="date"
                placeholder="End Date"
                value={searchParams.get('endDate') || ''}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className={`w-[150px] ${inputClassName}`}
            />

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-2"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}

