'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib';
import type { RentalTab, RentalTabCounts } from '@/entities/rental';
import { RENTAL_TABS } from '@/entities/rental';

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
                'relative flex shrink-0 items-center gap-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4',
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
    const listRef = useRef<HTMLDivElement>(null);
    const [hasMore, setHasMore] = useState(false);

    const measure = useCallback(() => {
        const list = listRef.current;
        if (!list) return;
        setHasMore(list.scrollWidth - list.clientWidth - list.scrollLeft > 4);
    }, []);

    useEffect(() => {
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [measure, counts]);

    return (
        <div className="relative">
            <div
                ref={listRef}
                role="tablist"
                aria-label="Filter rentals by status"
                onScroll={measure}
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
            {hasMore && (
                <div
                    aria-hidden="true"
                    data-testid="tabs-scroll-hint"
                    className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
                />
            )}
        </div>
    );
});