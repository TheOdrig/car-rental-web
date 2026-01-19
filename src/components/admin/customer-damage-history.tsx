'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DamageStatusBadge, DamageSeverityBadge } from '@/components/admin';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useCustomerDamages } from '@/lib/hooks';

interface CustomerDamageHistoryProps {
    userId: number;
    maxItems?: number;
}

export function CustomerDamageHistory({ userId, maxItems = 5 }: CustomerDamageHistoryProps) {
    const router = useRouter();
    const { data, isLoading } = useCustomerDamages(userId, 0, maxItems);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5" />
                        Damage History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const damages = data?.content || [];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Damage History
                </CardTitle>
                {data && data.totalElements > maxItems && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/damages?userId=${userId}`)}
                    >
                        View All ({data.totalElements})
                        <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {damages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No damage reports for this customer
                    </p>
                ) : (
                    <div className="space-y-3">
                        {damages.map((damage) => (
                            <div
                                key={damage.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                                onClick={() => router.push(`/admin/damages/${damage.id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-sm font-medium">{damage.carLicensePlate}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {damage.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DamageSeverityBadge severity={damage.severity} />
                                    <DamageStatusBadge status={damage.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
