'use client';

import { Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatDate } from '@/shared/lib';

interface RentalPeriodCardProps {
    startDate: string;
    endDate: string;
    days: number;
}

interface PeriodCellProps {
    label: string;
    date: string;
    dotClassName: string;
    className?: string;
}

function PeriodCell({ label, date, dotClassName, className }: PeriodCellProps) {
    return (
        <div className={`group p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30 ${className ?? ''}`}>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <div className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
                {label}
            </div>
            <p className="text-xl font-bold dark:text-white">{formatDate(date)}</p>
        </div>
    );
}

export function RentalPeriodCard({ startDate, endDate, days }: RentalPeriodCardProps) {
    return (
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                        <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                        </div>
                        Rental Period
                    </span>
                    <Badge
                        variant="secondary"
                        className="border-none bg-slate-100 font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                        {days} {days === 1 ? 'DAY' : 'DAYS'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative grid grid-cols-1 md:grid-cols-2">
                    <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                        <div className="rounded-full border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <ExternalLink className="h-4 w-4 rotate-45 text-slate-400" aria-hidden="true" />
                        </div>
                    </div>
                    <PeriodCell
                        label="Pick-up"
                        date={startDate}
                        dotClassName="bg-slate-400 dark:bg-slate-500"
                        className="border-b border-slate-100 dark:border-slate-800 md:border-b-0 md:border-r"
                    />
                    <PeriodCell
                        label="Return"
                        date={endDate}
                        dotClassName="bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
