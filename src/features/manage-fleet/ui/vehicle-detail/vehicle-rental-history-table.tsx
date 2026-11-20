'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/error-message';
import { EmptyState } from '@/shared/ui/empty-state';
import { useVehicleRentalHistory } from '../../api/fleet-api';
import { formatAmount, formatDate, formatRentalReference } from '@/shared/lib';
import { AdminRentalStatusBadge } from '@/entities/rental';

interface VehicleRentalHistoryTableProps {
    vehicleId: number;
}

export function VehicleRentalHistoryTable({ vehicleId }: VehicleRentalHistoryTableProps) {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError, refetch } = useVehicleRentalHistory(vehicleId, page);

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-info-subtle-foreground" />
                    Rental History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isError ? (
                    <ErrorMessage
                        title="Failed to load rental history"
                        message="The rental history could not be loaded."
                        onRetry={() => void refetch()}
                    />
                ) : isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : !data || data.content.length === 0 ? (
                    <EmptyState size="compact" icon={History} title="No rental history for this vehicle" />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Rental</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Customer</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Dates</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Duration</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.content.map((rental) => (
                                        <tr key={rental.id} className="border-b border-border hover:bg-raised">
                                            <td className="py-3 px-2">
                                                <Link
                                                    href={`/admin/rentals/${rental.id}`}
                                                    className="font-mono text-info-subtle-foreground hover:underline"
                                                >
                                                    {formatRentalReference(rental.id)}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-2">
                                                <Link
                                                    href={`/admin/users/${rental.customerId}`}
                                                    className="text-foreground hover:underline"
                                                >
                                                    {rental.customerName}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-2 text-muted-foreground">
                                                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                            </td>
                                            <td className="py-3 px-2 text-muted-foreground">
                                                {rental.duration} days
                                            </td>
                                            <td className="py-3 px-2 font-medium text-foreground">
                                                {formatAmount(rental.totalAmount, rental.currency)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <AdminRentalStatusBadge status={rental.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                <span className="text-sm text-muted-foreground">
                                    Page {page + 1} of {data.totalPages} ({data.totalElements} total)
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                                        disabled={page >= data.totalPages - 1}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}