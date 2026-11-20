'use client';

import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X, ExternalLink
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/shared/lib';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { getAlertStyles } from '../lib/utils';
import type { AdminAlert } from '../model/types';
import type { LucideIcon } from 'lucide-react';

interface AlertsPanelProps {
    alerts: AdminAlert[];
    onDismiss?: (alertId: string) => void;
    onAction?: (alertId: string, action: string) => void;
    className?: string;
}

const ICON_MAP: Record<AdminAlert['type'], LucideIcon> = {
    critical: AlertTriangle,
    warning: AlertCircle,
    info: Info,
    success: CheckCircle2,
};

export function AlertsPanel({
    alerts,
    onDismiss,
    onAction,
    className,
}: AlertsPanelProps) {
    if (alerts.length === 0) return null;

    return (
        <Card className={cn('border-none shadow-none bg-transparent', className)}>
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    System Alerts
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {alerts.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
                {alerts.map((alert) => {
                    const styles = getAlertStyles(alert.type);
                    const Icon = ICON_MAP[alert.type];

                    return (
                        <div
                            key={alert.id}
                            className={cn(
                                'relative flex items-start gap-4 p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md',
                                styles.bg,
                                styles.border
                            )}
                        >
                            <div className={cn('mt-0.5 shrink-0', styles.iconColor)}>
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0 pr-6">
                                <h2 className={cn('text-sm font-semibold', styles.text)}>
                                    {alert.actionUrl ? (
                                        <Link
                                            href={alert.actionUrl}
                                            className="underline-offset-2 after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline"
                                        >
                                            {alert.title}
                                        </Link>
                                    ) : (
                                        alert.title
                                    )}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {alert.description}
                                </p>

                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        {formatRelativeTime(alert.timestamp, { addSuffix: true })}
                                    </span>

                                    {alert.actions && alert.actions.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            {alert.actions.map((action, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant={action.variant || 'ghost'}
                                                    size="sm"
                                                    className="relative z-10 h-11 md:h-7 text-[11px] px-2.5"
                                                    onClick={() => onAction?.(alert.id, action.action)}
                                                >
                                                    {action.label}
                                                    {action.variant !== 'ghost' && <ExternalLink className="ml-1 h-3 w-3" />}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {alert.dismissible !== false && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 z-10 h-11 w-11 md:h-6 md:w-6 text-muted-foreground hover:text-foreground"
                                    onClick={() => onDismiss?.(alert.id)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                    <span className="sr-only">Dismiss</span>
                                </Button>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}