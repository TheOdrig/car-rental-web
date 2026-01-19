'use client';

import { usePenaltyHistory } from '@/lib/hooks/use-late-returns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { History, RefreshCw, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { safeFormatDate } from '@/lib/utils/format';

interface PenaltyHistorySectionProps {
    rentalId: number;
    currency?: string;
}

export function PenaltyHistorySection({ rentalId, currency = 'USD' }: PenaltyHistorySectionProps) {
    const { data: history, isLoading, isError } = usePenaltyHistory(rentalId);

    if (isLoading) {
        return <PenaltyHistorySkeleton />;
    }

    if (isError) {
        return null;
    }

    if (!history || history.length === 0) {
        return null;
    }

    const sortedHistory = [...history].sort(
        (a, b) => new Date(b.waivedAt).getTime() - new Date(a.waivedAt).getTime()
    );

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                    <History className="h-5 w-5" />
                    Penalty Waiver History
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sortedHistory.map((waiver) => (
                    <div
                        key={waiver.id}
                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {safeFormatDate(waiver.waivedAt, 'MMM d, yyyy h:mm a')}
                            </div>
                            {waiver.remainingPenalty === 0 && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                                    Full Waiver
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Original</div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatCurrency(waiver.originalPenalty, currency)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Waived</div>
                                <div className="font-medium text-orange-600 dark:text-orange-400">
                                    -{formatCurrency(waiver.waivedAmount, currency)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Remaining</div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatCurrency(waiver.remainingPenalty, currency)}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reason</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                {waiver.reason}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <div>Admin ID: #{waiver.adminId}</div>
                            {waiver.refundInitiated && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    {waiver.refundTransactionId ? (
                                        <>
                                            <CheckCircle className="h-3 w-3" />
                                            Refund: {waiver.refundTransactionId}
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-3 w-3" />
                                            Refund Initiated
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function PenaltyHistorySkeleton() {
    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <Skeleton className="h-4 w-32 mb-3" />
                        <div className="grid grid-cols-3 gap-4 mb-3">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
