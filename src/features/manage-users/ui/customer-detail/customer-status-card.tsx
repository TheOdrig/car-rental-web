'use client';

import { Activity, Clock, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatDateTime } from '@/shared/lib';
import { AccountStatusBadge, type CustomerAccountStatus, type AccountStatusType } from '@/entities/user';

interface CustomerStatusCardProps {
    accountStatus: CustomerAccountStatus;
}

const statusDescriptions: Record<AccountStatusType, string> = {
    ACTIVE: 'This account can log in and make rental requests',
    PENDING: 'This account is waiting for verification',
    BANNED: 'This account is banned from logging in and renting',
    LOCKED: 'This account is locked after failed sign-ins',
};

export function CustomerStatusCard({ accountStatus }: CustomerStatusCardProps) {
    const isBanned = accountStatus.status === 'BANNED';

    return (
        <Card className={`border-border ${isBanned ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-card'
            }`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    Account Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <AccountStatusBadge
 status={accountStatus.status}
 className="px-4 py-1 text-base"
 icon={accountStatus.status === 'BANNED' ? <Ban className="mr-1 h-4 w-4" /> : null}
 />
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
                                    {formatDateTime(accountStatus.bannedAt)}
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
                            {formatDateTime(accountStatus.lastStatusChange)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}