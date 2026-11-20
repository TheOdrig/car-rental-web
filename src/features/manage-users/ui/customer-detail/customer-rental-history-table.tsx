'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/error-message';
import { EmptyState } from '@/shared/ui/empty-state';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { useCustomerRentalHistory } from '../../api/users-api';
import { formatAmount, formatDate, formatRentalReference } from '@/shared/lib';
import { ADMIN_RENTAL_STATUS_LABELS, AdminRentalStatusBadge, type AdminRentalStatus } from '@/entities/rental';
import { ROUTES } from '@/shared/config/routes';

interface CustomerRentalHistoryTableProps {
    customerId: number;
}

const statusFilterOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'COMPLETED', label: ADMIN_RENTAL_STATUS_LABELS.COMPLETED },
    { value: 'ACTIVE', label: ADMIN_RENTAL_STATUS_LABELS.ACTIVE },
    { value: 'CANCELLED', label: ADMIN_RENTAL_STATUS_LABELS.CANCELLED },
    { value: 'PENDING', label: ADMIN_RENTAL_STATUS_LABELS.PENDING },
];

export function CustomerRentalHistoryTable({ customerId }: CustomerRentalHistoryTableProps) {
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data, isLoading, isError, refetch } = useCustomerRentalHistory(
        customerId,
        page,
        statusFilter === 'all' ? undefined : statusFilter as AdminRentalStatus
    );

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <History className="h-5 w-5 text-info-subtle-foreground" />
                        Rental History
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(0); }}>
                            <SelectTrigger aria-label="Filter rentals by status" className="w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusFilterOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
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
                    <EmptyState
 size="compact"
 icon={History}
 title={statusFilter === 'all' ? 'No rental history for this customer' : `No ${statusFilter.toLowerCase()} rentals found`}
 />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Rental</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Vehicle</th>
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
                                                    href={ROUTES.admin.fleetDetail(rental.carId)}
                                                    className="text-foreground hover:underline"
                                                >
                                                    {rental.vehicleName}
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