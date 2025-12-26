'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { RentalTab, RentalTabCounts } from '@/types';
import { RENTAL_TABS } from '@/lib/utils/rental-utils';

interface RentalTabsProps {
    activeTab: RentalTab;
    onTabChange: (tab: RentalTab) => void;
    counts: RentalTabCounts;
    className?: string;
}

interface TabButtonProps {
    tab: RentalTab;
    label: string;
    count: number;
    isActive: boolean;
    onClick: (tab: RentalTab) => void;
}

const TabButton = memo(function TabButton({
    tab,
    label,
    count,
    isActive,
    onClick,
}: TabButtonProps) {
    const handleClick = useCallback(() => {
        onClick(tab);
    }, [onClick, tab]);

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab}`}
            id={`tab-${tab}`}
            onClick={handleClick}
            className={cn(
                'relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                    ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary'
                    : 'text-muted-foreground'
            )}
        >
            <span>{label}</span>
            <span
                className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                )}
            >
                {count}
            </span>
        </button>
    );
});

export const RentalTabs = memo(function RentalTabs({
    activeTab,
    onTabChange,
    counts,
    className,
}: RentalTabsProps) {
    return (
        <div
            role="tablist"
            aria-label="Filter rentals by status"
            className={cn(
                'flex overflow-x-auto border-b scrollbar-hide',
                className
            )}
        >
            {RENTAL_TABS.map(({ value, label }) => (
                <TabButton
                    key={value}
                    tab={value}
                    label={label}
                    count={counts[value]}
                    isActive={activeTab === value}
                    onClick={onTabChange}
                />
            ))}
        </div>
    );
});
