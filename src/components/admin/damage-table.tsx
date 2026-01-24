'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DamageStatusBadge } from './damage-status-badge';
import { DamageSeverityBadge } from './damage-severity-badge';
import type { DamageReport } from '@/types';

interface DamageTableProps {
    damages: DamageReport[];
    isLoading?: boolean;
    onRowClick?: (damage: DamageReport) => void;
}

export function DamageTable({ damages, isLoading, onRowClick }: DamageTableProps) {
    const router = useRouter();

    const handleRowClick = (damage: DamageReport) => {
        if (onRowClick) {
            onRowClick(damage);
        } else {
            router.push(`/admin/damages/${damage.id}`);
        }
    };

    if (isLoading) {
        return <DamageTableSkeleton />;
    }

    if (damages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No damage reports found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Damage reports will appear here when created
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-700">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Vehicle</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Customer</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Description</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Severity</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Reported</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {damages.map((damage) => (
                        <TableRow
                            key={damage.id}
                            className="cursor-pointer border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            onClick={() => handleRowClick(damage)}
                        >
                            <TableCell className="font-medium text-slate-900 dark:text-white">
                                <Link
                                    href={`/admin/fleet/${damage.carId}`}
                                    className="hover:text-primary hover:underline transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {damage.carLicensePlate}
                                </Link>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                                {damage.customerName}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-slate-700 dark:text-slate-300">
                                {damage.description}
                            </TableCell>
                            <TableCell>
                                <DamageSeverityBadge severity={damage.severity} />
                            </TableCell>
                            <TableCell>
                                <DamageStatusBadge status={damage.status} />
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                                {new Date(damage.reportedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function DamageTableSkeleton() {
    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-700">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Vehicle</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Customer</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Description</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Severity</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Reported</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-slate-200 dark:border-slate-700">
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
