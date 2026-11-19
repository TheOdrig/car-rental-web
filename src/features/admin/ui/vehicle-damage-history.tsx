'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/error-message';
import { DamageStatusBadge } from '@/entities/damage';
import { DamageSeverityBadge } from '@/entities/damage';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useVehicleDamages } from '@/entities/damage';

interface VehicleDamageHistoryProps {
    carId: number;
    maxItems?: number;
}

export function VehicleDamageHistory({ carId, maxItems = 5 }: VehicleDamageHistoryProps) {
    const router = useRouter();
    const { data, isLoading, isError, refetch } = useVehicleDamages(carId, 0, maxItems);

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

    if (isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5" />
                        Damage History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ErrorMessage
                        title="Failed to load damage history"
                        message="The damage reports could not be loaded."
                        onRetry={() => void refetch()}
                    />
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
                        onClick={() => router.push(`/admin/damages?carId=${carId}`)}
                    >
                        View All ({data.totalElements})
                        <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {damages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No damage reports for this vehicle
                    </p>
                ) : (
                    <div className="space-y-3">
                        {damages.map((damage) => (
                            <Link
                                key={damage.id}
                                href={`/admin/damages/${damage.id}`}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-sm font-medium line-clamp-1">
                                            {damage.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(damage.reportedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DamageSeverityBadge severity={damage.severity} />
                                    <DamageStatusBadge status={damage.status} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}