'use client';

import { Activity, Clock, User, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { safeFormatDate } from '@/lib/utils/format';
import type { CustomerAccountStatus, AccountStatusType } from '@/types';

interface CustomerStatusCardProps {
    accountStatus: CustomerAccountStatus;
}

const statusColors: Record<AccountStatusType, string> = {
    ACTIVE: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700',
    PENDING: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
    BANNED: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
};

const statusDescriptions: Record<AccountStatusType, string> = {
    ACTIVE: 'Customer account is active and in good standing',
    PENDING: 'Customer account is pending verification',
    BANNED: 'Customer account has been banned',
};

export function CustomerStatusCard({ accountStatus }: CustomerStatusCardProps) {
    const isBanned = accountStatus.status === 'BANNED';

    return (
        <Card className={`border-white/50 dark:border-white/5 backdrop-blur-sm ${isBanned ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-white/30 dark:bg-slate-900/30'
            }`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-rose-500" />
                    Account Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className={`${statusColors[accountStatus.status]} text-base px-4 py-1`} variant="outline">
                        {accountStatus.status === 'BANNED' && <Ban className="h-4 w-4 mr-1" />}
                        {accountStatus.status}
                    </Badge>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {statusDescriptions[accountStatus.status]}
                </p>

                {isBanned && accountStatus.banReason && (
                    <div className="border-t border-red-200 dark:border-red-900/50 pt-4 space-y-2">
                        <div>
                            <span className="text-xs text-red-600 dark:text-red-400 block mb-1">Ban Reason</span>
                            <p className="text-sm text-slate-900 dark:text-slate-100 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                                {accountStatus.banReason}
                            </p>
                        </div>
                        {accountStatus.bannedAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-red-500" />
                                <span className="text-slate-500 dark:text-slate-400">Banned on:</span>
                                <span className="text-slate-900 dark:text-slate-100">
                                    {safeFormatDate(accountStatus.bannedAt, 'datetime')}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500 dark:text-slate-400">Last status change:</span>
                        <span className="text-slate-900 dark:text-slate-100">
                            {safeFormatDate(accountStatus.lastStatusChange, 'datetime')}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
