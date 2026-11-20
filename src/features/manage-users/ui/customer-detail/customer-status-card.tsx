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
        <Card className={`border-border ${isBanned ? 'bg-danger-subtle' : 'bg-card'
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

                <p className="text-sm text-muted-foreground">
                    {statusDescriptions[accountStatus.status]}
                </p>

                {isBanned && accountStatus.banReason && (
                    <div className="border-t border-danger-subtle-foreground/30 pt-4 space-y-2">
                        <div>
                            <span className="text-xs text-danger-subtle-foreground block mb-1">Ban Reason</span>
                            <p className="text-sm text-foreground bg-danger-subtle p-3 rounded-lg">
                                {accountStatus.banReason}
                            </p>
                        </div>
                        {accountStatus.bannedAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-danger-subtle-foreground" />
                                <span className="text-muted-foreground">Banned on:</span>
                                <span className="text-foreground">
                                    {formatDateTime(accountStatus.bannedAt)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last status change:</span>
                        <span className="text-foreground">
                            {formatDateTime(accountStatus.lastStatusChange)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}