'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/lib/stores/filter-store';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Rating: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
];

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
    className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
            <SelectTrigger className={cn('w-[180px]', className)} suppressHydrationWarning>
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

