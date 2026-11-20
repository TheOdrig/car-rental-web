import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface StatTileProps {
    label: string;
    value: ReactNode;
    icon?: ElementType;
    dotClassName?: string;
    hint?: string;
    className?: string;
}

export function StatTile({ label, value, icon: Icon, dotClassName, hint, className }: StatTileProps) {
    return (
        <div className={cn('flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm', className)}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    {dotClassName && <span aria-hidden="true" className={cn('h-2 w-2 shrink-0 rounded-full', dotClassName)} />}
                    <span className="min-w-0 text-sm font-medium text-muted-foreground">{label}</span>
                </div>
                {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
            </div>
            <div>
                <span className="text-2xl font-semibold tabular-nums text-foreground">{value}</span>
                {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
            </div>
        </div>
    );
}
