'use client';

import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LateReturnStatusBadge } from './late-return-status-badge';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { formatLateTime, type LateReturnReport } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

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
        return <LateReturnsEmptyState />;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-slate-700 dark:text-slate-300">Customer</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">Vehicle</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">End Date</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">Late Time</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">Penalty</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow
                                key={item.rentalId}
                                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                onClick={() => handleRowClick(item.rentalId)}
                            >
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                            {item.customerName}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {item.customerEmail}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                            {item.carBrand} {item.carModel}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {item.licensePlate}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300">
                                    {new Date(item.endDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                        <Clock className="h-4 w-4" />
                                        {formatLateTime(item.lateHours)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-slate-900 dark:text-slate-100">
                                        {formatCurrency(item.penaltyAmount, item.currency)}
                                    </div>
                                    {item.penaltyPaid && (
                                        <span className="text-xs text-green-600 dark:text-green-400">Paid</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <LateReturnStatusBadge status={item.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
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

function LateReturnsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                No Late Returns
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                All rentals are being returned on time. Great job!
            </p>
        </div>
    );
}
