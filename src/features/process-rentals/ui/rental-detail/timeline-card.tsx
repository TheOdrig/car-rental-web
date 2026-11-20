'use client';

import { Clock, CheckCircle2, XCircle, AlertCircle, Car, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatDateTime } from '@/shared/lib';
import { cn } from '@/shared/lib';
import type { TimelineEvent, TimelineEventType } from '@/entities/rental';
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
    note_added: AlertCircle,
};

const eventColors: Record<TimelineEventType, string> = {
    created: 'bg-muted text-muted-foreground',
    approved: 'bg-success-subtle text-success-subtle-foreground',
    rejected: 'bg-danger-subtle text-danger-subtle-foreground',
    cancelled: 'bg-danger-subtle text-danger-subtle-foreground',
    picked_up: 'bg-info-subtle text-info-subtle-foreground',
    returned: 'bg-info-subtle text-info-subtle-foreground',
    note_added: 'bg-warning-subtle text-warning-subtle-foreground',
};

const eventLabels: Record<TimelineEventType, string> = {
    created: 'Rental Created',
    approved: 'Booking Confirmed',
    rejected: 'Booking Rejected',
    cancelled: 'Booking Cancelled',
    picked_up: 'Vehicle Picked Up',
    returned: 'Vehicle Returned',
    note_added: 'Admin Note Added',
};

export function TimelineCard({ events }: TimelineCardProps) {
    const sortedEvents = [...events].reverse();

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent" />

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
                                            <span className="font-medium text-foreground">
                                                {label}
                                            </span>
                                            {event.timestamp && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDateTime(event.timestamp)}
                                                </span>
                                            )}
                                        </div>

                                        {event.adminName && (
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                by {event.adminName}
                                            </p>
                                        )}

                                        {event.notes && (
                                            <p className="text-sm text-muted-foreground mt-1 italic">
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