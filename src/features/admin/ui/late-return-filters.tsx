'use client';

import { useCallback } from 'react';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { X } from 'lucide-react';
import { LATE_RETURN_STATUS_LABELS, type LateReturnStatus } from '@/entities/rental';
import { useUrlState } from '@/shared/lib/use-url-state';

const STATUS_OPTIONS: { value: LateReturnStatus; label: string }[] = (
    ['GRACE_PERIOD', 'LATE', 'SEVERELY_LATE'] as const
).map((value) => ({ value, label: LATE_RETURN_STATUS_LABELS[value] }));

const SORT_BY_OPTIONS = [
    { value: 'endDate', label: 'End Date' },
    { value: 'penaltyAmount', label: 'Penalty Amount' },
    { value: 'lateHours', label: 'Late Hours' },
];

const SORT_DIRECTION_OPTIONS = [
    { value: 'DESC', label: 'Descending' },
    { value: 'ASC', label: 'Ascending' },
];

const triggerClassName = "bg-background border-border hover:bg-accent transition-colors cursor-pointer text-foreground";

const inputClassName = "bg-background border-border hover:bg-accent transition-colors text-foreground";

export function LateReturnFilters() {
    const { searchParams, update, clear } = useUrlState();

    const updateFilter = useCallback(
        (key: string, value: string | null) => {
            update({ [key]: value && value !== 'all' ? value : null, page: 0 });
        },
        [update]
    );

    const clearFilters = clear;

    const hasFilters =
        searchParams?.has('status') ||
        searchParams?.has('startDate') ||
        searchParams?.has('endDate') ||
        searchParams?.has('sortBy') ||
        searchParams?.has('sortDirection');

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Select
                value={searchParams?.get('status') || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
            >
                <SelectTrigger aria-label="Filter by status" className={`w-[150px] ${triggerClassName}`}>
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
                value={searchParams?.get('startDate') || ''}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className={`w-[150px] ${inputClassName}`}
            />

            <Input
                type="date"
                placeholder="End Date"
                value={searchParams?.get('endDate') || ''}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className={`w-[150px] ${inputClassName}`}
            />

            <Select
                value={searchParams?.get('sortBy') || 'endDate'}
                onValueChange={(value) => updateFilter('sortBy', value)}
            >
                <SelectTrigger aria-label="Sort by" className={`w-[150px] ${triggerClassName}`}>
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
                value={searchParams?.get('sortDirection') || 'DESC'}
                onValueChange={(value) => updateFilter('sortDirection', value)}
            >
                <SelectTrigger aria-label="Sort direction" className={`w-[140px] ${triggerClassName}`}>
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
                    className="h-11 px-2 md:h-9"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}