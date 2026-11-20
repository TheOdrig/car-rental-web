'use client';

import { Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatDate } from '@/shared/lib';

interface RentalPeriodCardProps {
    startDate: string;
    endDate: string;
    days: number;
    returnedAt?: string | null;
}

interface PeriodCellProps {
    label: string;
    date: string;
    note?: string;
    dotClassName: string;
    className?: string;
}

function PeriodCell({ label, date, note, dotClassName, className }: PeriodCellProps) {
    return (
        <div className={`group p-6 transition-colors hover:bg-raised ${className ?? ''}`}>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
                {label}
            </div>
            <p className="text-xl font-bold dark:text-white">{formatDate(date)}</p>
            {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
        </div>
    );
}

export function RentalPeriodCard({ startDate, endDate, days, returnedAt }: RentalPeriodCardProps) {
    const returnedEarly = !!returnedAt && formatDate(returnedAt) !== formatDate(endDate);
    return (
        <Card className="overflow-hidden border-border shadow-md">
            <CardHeader className="border-b border-border bg-raised">
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-base font-bold text-foreground">
                        <div className="rounded-lg border border-border bg-card p-1.5 shadow-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                        Rental Period
                    </span>
                    <Badge
                        variant="secondary"
                        className="border-none bg-muted font-bold tabular-nums text-foreground"
                    >
                        {days} {days === 1 ? 'DAY' : 'DAYS'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative grid grid-cols-1 md:grid-cols-2">
                    <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                        <div className="rounded-full border border-border bg-card p-2 shadow-sm">
                            <ExternalLink className="h-4 w-4 rotate-45 text-muted-foreground" aria-hidden="true" />
                        </div>
                    </div>
                    <PeriodCell
                        label="Pick-up"
                        date={startDate}
                        dotClassName="bg-muted-foreground"
                        className="border-b border-border md:border-b-0 md:border-r"
                    />
                    <PeriodCell
                        label={returnedAt ? 'Returned' : 'Return'}
                        date={returnedEarly ? returnedAt : endDate}
                        note={returnedEarly ? `Booked until ${formatDate(endDate)}` : undefined}
                        dotClassName="bg-destructive shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
