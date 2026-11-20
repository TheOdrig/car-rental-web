'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/shared/ui/card';
import { Pagination } from '@/shared/ui/pagination';
import { ResponsiveDataView } from '@/shared/ui/responsive-data-view';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { formatAmount, formatDate, formatRentalReference } from '@/shared/lib';
import { RentalStatusBadge, type Rental } from '@/entities/rental';
import { ROUTES } from '@/shared/config/routes';

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

function customerName(rental: Rental): string {
    return rental.userSummary?.fullName || rental.userSummary?.username || rental.userSummary?.email || 'Unknown';
}

function vehicleName(rental: Rental): string {
    return rental.carSummary ? `${rental.carSummary.brand} ${rental.carSummary.model}` : 'Unknown vehicle';
}

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
                    <ResponsiveDataView
                        mobile={
                            <ul className="space-y-3" aria-label="All rentals">
                                {rentals.map((rental) => (
                                    <li key={rental.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <Link
                                                href={ROUTES.admin.rental(rental.id)}
                                                className="inline-flex min-h-11 items-center font-mono text-sm text-primary hover:underline"
                                            >
                                                {formatRentalReference(rental.id)}
                                            </Link>
                                            <RentalStatusBadge status={rental.status} />
                                        </div>
                                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                            <dt className="text-muted-foreground">Customer</dt>
                                            <dd className="min-w-0 truncate text-right">{customerName(rental)}</dd>
                                            <dt className="text-muted-foreground">Vehicle</dt>
                                            <dd className="min-w-0 truncate text-right">{vehicleName(rental)}</dd>
                                            <dt className="text-muted-foreground">Dates</dt>
                                            <dd className="text-right">
                                                {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
                                            </dd>
                                            <dt className="text-muted-foreground">Amount</dt>
                                            <dd className="text-right font-medium tabular-nums text-foreground">
                                                {formatAmount(rental.totalPrice, rental.currency)}
                                            </dd>
                                        </dl>
                                    </li>
                                ))}
                            </ul>
                        }
                        desktop={
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
                                                    <Link href={ROUTES.admin.rental(rental.id)} className="text-primary hover:underline">
                                                        {formatRentalReference(rental.id)}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="max-w-[14rem] truncate">
                                                    {customerName(rental)}
                                                </TableCell>
                                                <TableCell className="max-w-[14rem] truncate">
                                                    {vehicleName(rental)}
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
                        }
                    />
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
