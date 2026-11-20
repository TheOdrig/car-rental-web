'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/error-message';
import { EmptyState } from '@/shared/ui/empty-state';
import { ResponsiveDataView } from '@/shared/ui/responsive-data-view';
import { useVehicleRentalHistory } from '../../api/fleet-api';
import { formatAmount, formatDate, formatRentalReference } from '@/shared/lib';
import { AdminRentalStatusBadge } from '@/entities/rental';
import { ROUTES } from '@/shared/config/routes';

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
                        <ResponsiveDataView
                            mobile={
                                <ul className="space-y-3" aria-label="Rental history">
                                    {data.content.map((rental) => (
                                        <li key={rental.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Link
                                                    href={ROUTES.admin.rental(rental.id)}
                                                    className="inline-flex min-h-11 items-center font-mono text-info-subtle-foreground hover:underline"
                                                >
                                                    {formatRentalReference(rental.id)}
                                                </Link>
                                                <AdminRentalStatusBadge status={rental.status} />
                                            </div>
                                            <Link
                                                href={ROUTES.admin.user(rental.customerId)}
                                                className="flex min-h-11 min-w-0 items-center truncate text-foreground hover:underline"
                                            >
                                                {rental.customerName}
                                            </Link>
                                            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                                <dt className="text-muted-foreground">Dates</dt>
                                                <dd className="text-right">
                                                    {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                                </dd>
                                                <dt className="text-muted-foreground">Duration</dt>
                                                <dd className="text-right">{rental.duration} days</dd>
                                                <dt className="text-muted-foreground">Amount</dt>
                                                <dd className="text-right font-medium text-foreground">
                                                    {formatAmount(rental.totalAmount, rental.currency)}
                                                </dd>
                                            </dl>
                                        </li>
                                    ))}
                                </ul>
                            }
                            desktop={
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
                                                            href={ROUTES.admin.rental(rental.id)}
                                                            className="font-mono text-info-subtle-foreground hover:underline"
                                                        >
                                                            {formatRentalReference(rental.id)}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <Link
                                                            href={ROUTES.admin.user(rental.customerId)}
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
                            }
                        />

                        {data.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                <span className="text-sm text-muted-foreground">
                                    Page {page + 1} of {data.totalPages} ({data.totalElements} total)
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        aria-label="Previous page"
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        aria-label="Next page"
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