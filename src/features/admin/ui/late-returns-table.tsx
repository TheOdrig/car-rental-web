'use client';

import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { LateReturnStatusBadge, formatLateTime, type LateReturnReport } from '@/entities/rental';
import { formatCurrency, formatDate } from '@/shared/lib';

interface LateReturnsTableProps {
    data: LateReturnReport[];
    isLoading?: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function LateReturnsTable({
    data,
    isLoading,
    page,
    totalPages,
    onPageChange,
}: LateReturnsTableProps) {
    const router = useRouter();

    const handleRowClick = (rentalId: number) => {
        router.push(`/admin/rentals/${rentalId}`);
    };

    if (isLoading) {
        return <LateReturnsTableSkeleton />;
    }

    if (data.length === 0) {
        return <EmptyState icon={CheckCircle} title="No Late Returns" description="All rentals are being returned on time. Great job!" />;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card">
                <Table className="stack-table">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Customer</TableHead>
                            <TableHead className="text-muted-foreground">Vehicle</TableHead>
                            <TableHead className="text-muted-foreground">End Date</TableHead>
                            <TableHead className="text-muted-foreground">Late Time</TableHead>
                            <TableHead className="text-muted-foreground">Penalty</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow
                                key={item.rentalId}
                                className="cursor-pointer hover:bg-raised"
                                onClick={() => handleRowClick(item.rentalId)}
                            >
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {item.customerName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.customerEmail}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell data-label="Vehicle" data-wide>
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {item.carBrand} {item.carModel}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.licensePlate}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell data-label="End Date" className="text-muted-foreground">
                                    {formatDate(item.endDate)}
                                </TableCell>
                                <TableCell data-label="Late Time">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {formatLateTime(item.lateHours)}
                                    </div>
                                </TableCell>
                                <TableCell data-label="Penalty">
                                    <div className="font-medium text-foreground">
                                        {formatCurrency(item.penaltyAmount, item.currency)}
                                    </div>
                                    {item.penaltyPaid && (
                                        <span className="text-xs text-success-subtle-foreground">Paid</span>
                                    )}
                                </TableCell>
                                <TableCell data-label="Status">
                                    <LateReturnStatusBadge status={item.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function LateReturnsTableSkeleton() {
    return (
        <div className="rounded-lg border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Late Time</TableHead>
                        <TableHead>Penalty</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-40 mt-1" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-20 mt-1" />
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

