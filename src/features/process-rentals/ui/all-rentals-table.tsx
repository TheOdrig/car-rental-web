'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/shared/ui/card';
import { Pagination } from '@/shared/ui/pagination';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { formatAmount, formatDate, formatRentalReference } from '@/shared/lib';
import { RentalStatusBadge, type Rental } from '@/entities/rental';

interface AllRentalsTableProps {
    rentals: Rental[];
    isLoading?: boolean;
    page: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    emptyMessage?: string;
}

const HEAD_CLASS = 'text-muted-foreground font-semibold';

export function AllRentalsTable({
    rentals,
    isLoading = false,
    page,
    totalPages,
    totalElements,
    onPageChange,
    emptyMessage = 'No rentals found',
}: AllRentalsTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="space-y-3 py-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-10 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6">
                {rentals.length === 0 ? (
                    <p className="py-10 text-center text-muted-foreground">{emptyMessage}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={HEAD_CLASS}>Reference</TableHead>
                                    <TableHead className={HEAD_CLASS}>Customer</TableHead>
                                    <TableHead className={HEAD_CLASS}>Vehicle</TableHead>
                                    <TableHead className={HEAD_CLASS}>Dates</TableHead>
                                    <TableHead className={HEAD_CLASS}>Amount</TableHead>
                                    <TableHead className={HEAD_CLASS}>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentals.map((rental) => (
                                    <TableRow key={rental.id}>
                                        <TableCell className="whitespace-nowrap font-mono text-sm">
                                            <Link href={`/admin/rentals/${rental.id}`} className="text-primary hover:underline">
                                                {formatRentalReference(rental.id)}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="max-w-[14rem] truncate">
                                            {rental.userSummary?.fullName || rental.userSummary?.username || rental.userSummary?.email || 'Unknown'}
                                        </TableCell>
                                        <TableCell className="max-w-[14rem] truncate">
                                            {rental.carSummary ? `${rental.carSummary.brand} ${rental.carSummary.model}` : 'Unknown vehicle'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">
                                            {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-medium tabular-nums">
                                            {formatAmount(rental.totalPrice, rental.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <RentalStatusBadge status={rental.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {totalElements} {totalElements === 1 ? 'rental' : 'rentals'} in total
                    </p>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
                </div>
            </CardContent>
        </Card>
    );
}
