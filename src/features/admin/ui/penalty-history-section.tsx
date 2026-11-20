'use client';

import { usePenaltyHistory } from '../api/use-late-returns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { History, RefreshCw, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/shared/lib';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';

interface PenaltyHistorySectionProps {
    rentalId: number;
    currency?: string;
}

export function PenaltyHistorySection({ rentalId, currency = DEFAULT_CURRENCY }: PenaltyHistorySectionProps) {
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
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <History className="h-5 w-5" />
                    Penalty Waiver History
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sortedHistory.map((waiver) => (
                    <div
                        key={waiver.id}
                        className="p-4 rounded-lg bg-raised border border-border"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="text-sm text-muted-foreground">
                                {formatDateTime(waiver.waivedAt)}
                            </div>
                            {waiver.remainingPenalty === 0 && (
                                <Badge variant="success">
                                    Full Waiver
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                                <div className="text-xs text-muted-foreground">Original</div>
                                <div className="font-medium text-foreground">
                                    {formatCurrency(waiver.originalPenalty, currency)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Waived</div>
                                <div className="font-medium text-warning-subtle-foreground">
                                    -{formatCurrency(waiver.waivedAmount, currency)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Remaining</div>
                                <div className="font-medium text-foreground">
                                    {formatCurrency(waiver.remainingPenalty, currency)}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Reason</div>
                            <div className="text-sm text-muted-foreground">
                                {waiver.reason}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div>Admin ID: #{waiver.adminId}</div>
                            {waiver.refundInitiated && (
                                <div className="flex items-center gap-1 text-success-subtle-foreground">
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
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-raised">
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
