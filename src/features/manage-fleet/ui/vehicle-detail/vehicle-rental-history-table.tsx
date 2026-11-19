'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/error-message';
import { useVehicleRentalHistory } from '../../api/fleet-api';
import { formatAmount, formatDate, formatRentalReference } from '@/shared/lib';
import { ADMIN_RENTAL_STATUS_LABELS, type AdminRentalStatus } from '@/entities/rental';

interface VehicleRentalHistoryTableProps {
    vehicleId: number;
}

const statusVariants: Record<AdminRentalStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'secondary',
    CONFIRMED: 'default',
    ACTIVE: 'default',
    COMPLETED: 'outline',
    CANCELLED: 'destructive',
    REJECTED: 'destructive',
    OVERDUE: 'destructive',
};

export function VehicleRentalHistoryTable({ vehicleId }: VehicleRentalHistoryTableProps) {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError, refetch } = useVehicleRentalHistory(vehicleId, page);

    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-teal-500" />
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
                    <div className="text-center py-8">
                        <History className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No rental history for this vehicle</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Rental</th>
                                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Customer</th>
                                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Dates</th>
                                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Duration</th>
                                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Amount</th>
                                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.content.map((rental) => (
                                        <tr key={rental.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="py-3 px-2">
                                                <Link
                                                    href={`/admin/rentals/${rental.id}`}
                                                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {formatRentalReference(rental.id)}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-2">
                                                <Link
                                                    href={`/admin/users/${rental.customerId}`}
                                                    className="text-slate-900 dark:text-slate-100 hover:underline"
                                                >
                                                    {rental.customerName}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                                                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                            </td>
                                            <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                                                {rental.duration} days
                                            </td>
                                            <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">
                                                {formatAmount(rental.totalAmount, rental.currency)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <Badge variant={statusVariants[rental.status as AdminRentalStatus] || 'outline'}>
                                                    {ADMIN_RENTAL_STATUS_LABELS[rental.status as AdminRentalStatus] ?? rental.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
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