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
import type { LateReturnStatus } from '@/types';

const STATUS_OPTIONS: { value: LateReturnStatus; label: string }[] = [
    { value: 'GRACE_PERIOD', label: 'Grace Period' },
    { value: 'LATE', label: 'Late' },
    { value: 'SEVERELY_LATE', label: 'Severely Late' },
];

const SORT_BY_OPTIONS = [
    { value: 'endDate', label: 'End Date' },
    { value: 'penaltyAmount', label: 'Penalty Amount' },
    { value: 'lateHours', label: 'Late Hours' },
];

const SORT_DIRECTION_OPTIONS = [
    { value: 'DESC', label: 'Descending' },
    { value: 'ASC', label: 'Ascending' },
];

const triggerClassName = "bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100";

const inputClassName = "bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100";

export function LateReturnFilters() {
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
        searchParams.has('status') ||
        searchParams.has('startDate') ||
        searchParams.has('endDate') ||
        searchParams.has('sortBy') ||
        searchParams.has('sortDirection');

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Select
                value={searchParams.get('status') || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
            >
                <SelectTrigger className={`w-[150px] ${triggerClassName}`}>
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

            <Select
                value={searchParams.get('sortBy') || 'endDate'}
                onValueChange={(value) => updateFilter('sortBy', value)}
            >
                <SelectTrigger className={`w-[150px] ${triggerClassName}`}>
                    <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_BY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={searchParams.get('sortDirection') || 'DESC'}
                onValueChange={(value) => updateFilter('sortDirection', value)}
            >
                <SelectTrigger className={`w-[140px] ${triggerClassName}`}>
                    <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_DIRECTION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

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
