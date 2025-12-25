'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
    className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
    return (
        <div className={cn('flex items-center border rounded-lg p-1', className)}>
            <Button
                variant={value === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onChange('grid')}
                className="h-8 w-8 p-0"
                aria-label="Grid view"
                aria-pressed={value === 'grid'}
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
                variant={value === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onChange('list')}
                className="h-8 w-8 p-0"
                aria-label="List view"
                aria-pressed={value === 'list'}
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    );
}
