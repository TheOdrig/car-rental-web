'use client';

import { Clock, CheckCircle2, XCircle, AlertCircle, Car, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { safeFormatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface TimelineCardProps {
    events: TimelineEvent[];
}

const eventIcons: Record<TimelineEventType, LucideIcon> = {
    created: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
    cancelled: XCircle,
    picked_up: Car,
    returned: CalendarCheck,
};

const eventColors: Record<TimelineEventType, string> = {
    created: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    approved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    picked_up: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    returned: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
};

const eventLabels: Record<TimelineEventType, string> = {
    created: 'Rental Created',
    approved: 'Booking Confirmed',
    rejected: 'Booking Rejected',
    cancelled: 'Booking Cancelled',
    picked_up: 'Vehicle Picked Up',
    returned: 'Vehicle Returned',
};

export function TimelineCard({ events }: TimelineCardProps) {
    const sortedEvents = [...events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-violet-500" />
                    Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                    <div className="space-y-4">
                        {sortedEvents.map((event, index) => {
                            const Icon = eventIcons[event.type] ?? Clock;
                            const colorClass = eventColors[event.type] ?? eventColors.created;
                            const label = eventLabels[event.type] ?? event.type;

                            return (
                                <div key={index} className="relative flex gap-4 pl-10">
                                    <div
                                        className={cn(
                                            'absolute left-0 p-2 rounded-full',
                                            colorClass
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                {label}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {safeFormatDate(event.timestamp, 'datetime')}
                                            </span>
                                        </div>

                                        {event.adminName && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                                by {event.adminName}
                                            </p>
                                        )}

                                        {event.notes && (
                                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 italic">
                                                &quot;{event.notes}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

