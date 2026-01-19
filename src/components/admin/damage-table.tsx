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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {damages.map((damage) => (
                        <TableRow
                            key={damage.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleRowClick(damage)}
                        >
                            <TableCell className="font-medium">
                                {damage.carLicensePlate}
                            </TableCell>
                            <TableCell>{damage.customerName}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                                {damage.description}
                            </TableCell>
                            <TableCell>
                                <DamageSeverityBadge severity={damage.severity} />
                            </TableCell>
                            <TableCell>
                                <DamageStatusBadge status={damage.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(damage.reportedAt).toLocaleDateString()}
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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
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
