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
} from '@/shared/ui/table';
import { Skeleton } from '@/shared/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';
import { DamageStatusBadge, DamageSeverityBadge } from '@/entities/damage';
import { VehicleLabel } from '@/entities/car';
import type { DamageReport } from '@/entities/damage';
import { formatDate } from '@/shared/lib';

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
            <EmptyState icon={AlertTriangle} title="No damage reports found" description="Damage reports will appear here when created" />
        );
    }

    return (
        <div className="rounded-md border border-border">
            <Table className="stack-table">
                <TableHeader>
                    <TableRow className="border-b border-border bg-raised">
                        <TableHead className="text-muted-foreground font-semibold">Vehicle</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Customer</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Description</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Severity</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Reported</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {damages.map((damage) => (
                        <TableRow
                            key={damage.id}
                            className="cursor-pointer border-b border-border hover:bg-accent"
                            onClick={() => handleRowClick(damage)}
                        >
                            <TableCell className="font-medium text-foreground">
                                <Link
                                    href={`/admin/fleet/${damage.carId}`}
                                    className="hover:text-primary hover:underline transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <VehicleLabel carSummary={damage.carSummary} licensePlate={damage.carLicensePlate} stacked />
                                </Link>
                            </TableCell>
                            <TableCell data-label="Customer" className="text-muted-foreground">
                                {damage.customerName}
                            </TableCell>
                            <TableCell data-label="Description" data-wide className="max-w-[200px] truncate text-muted-foreground">
                                <Link
                                    href={`/admin/damages/${damage.id}`}
                                    className="hover:text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {damage.description}
                                </Link>
                            </TableCell>
                            <TableCell data-label="Severity">
                                <DamageSeverityBadge severity={damage.severity} />
                            </TableCell>
                            <TableCell data-label="Status">
                                <DamageStatusBadge status={damage.status} />
                            </TableCell>
                            <TableCell data-label="Reported" className="text-muted-foreground">
                                {formatDate(damage.reportedAt)}
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
        <div className="rounded-md border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border bg-raised">
                        <TableHead className="text-muted-foreground font-semibold">Vehicle</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Customer</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Description</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Severity</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Reported</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-border">
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