'use client';

import { memo, useState } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { DamageReportForm } from '@/entities/damage';
import type { PendingItem, ProcessReturnData } from '@/entities/rental';
import { ApproveRentalDialog } from '../approve-rental-dialog';
import { ProcessPickupDialog } from '../process-pickup-dialog';
import { ProcessReturnDialog } from '../process-return-dialog';
import { RejectRentalDialog } from '../reject-rental-dialog';
import type { PendingRentalsType } from './format';
import type { PendingAction } from './pending-rental-action';
import { PendingRentalRow } from './pending-rental-row';
import { PendingRentalsSkeleton } from './pending-rentals-skeleton';

interface PendingRentalsTableProps {
    items: PendingItem[];
    total?: number;
    type: PendingRentalsType;
    isLoading?: boolean;
    onApprove?: (rentalId: number, notes?: string) => void;
    onReject?: (rentalId: number, reason: string) => void;
    onPickup?: (rentalId: number, notes?: string) => void;
    onReturn?: (rentalId: number, data?: ProcessReturnData) => void;
    onReportDamage?: (rentalId: number) => void;
    actionInProgress?: number | null;
    className?: string;
}

const HEAD_CLASS = 'text-slate-600 dark:text-slate-300 font-semibold';

export const PendingRentalsTable = memo(function PendingRentalsTable({
    items,
    total,
    type,
    isLoading = false,
    onApprove,
    onReject,
    onPickup,
    onReturn,
    actionInProgress,
    className,
}: PendingRentalsTableProps) {
    const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
    const [dialogState, setDialogState] = useState<{ type: PendingAction | null; open: boolean }>({
        type: null,
        open: false,
    });
    const [damageDialogOpen, setDamageDialogOpen] = useState(false);
    const [damageRentalId, setDamageRentalId] = useState<number | null>(null);

    const handleAction = (item: PendingItem, action: PendingAction) => {
        setSelectedItem(item);
        setDialogState({ type: action, open: true });
    };

    const handleOpenChange = (open: boolean) => setDialogState({ ...dialogState, open });

    const handleApproveConfirm = (rentalId: number, notes?: string) => {
        onApprove?.(rentalId, notes);
        setDialogState({ ...dialogState, open: false });
    };

    const handleRejectConfirm = (rentalId: number, reason: string) => {
        onReject?.(rentalId, reason);
        setDialogState({ ...dialogState, open: false });
    };

    if (isLoading) {
        return <PendingRentalsSkeleton className={className} />;
    }

    if (items.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
                    <p className="text-center text-muted-foreground">No pending {type} at the moment</p>
                </CardContent>
            </Card>
        );
    }

    const isActionOpen = (action: PendingAction) => dialogState.open && dialogState.type === action;

    return (
        <>
            <Card className={className}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize">
                        Pending {type}
                        <Badge variant="secondary" className="ml-2">
                            {total ?? items.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-200 dark:border-slate-700">
                                    <TableHead className={HEAD_CLASS}>Customer</TableHead>
                                    <TableHead className={HEAD_CLASS}>Vehicle</TableHead>
                                    <TableHead className={HEAD_CLASS}>Dates</TableHead>
                                    <TableHead className={HEAD_CLASS}>Amount</TableHead>
                                    <TableHead className={HEAD_CLASS}>Status</TableHead>
                                    {type === 'overdue' && <TableHead className={HEAD_CLASS}>Late</TableHead>}
                                    <TableHead className={`text-right ${HEAD_CLASS}`}>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <PendingRentalRow
                                        key={item.rentalId}
                                        item={item}
                                        type={type}
                                        isProcessing={actionInProgress === item.rentalId}
                                        onAction={handleAction}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {total !== undefined && total > items.length && (
                        <p className="mt-3 text-sm text-muted-foreground" data-testid="pending-truncated">
                            Showing the first {items.length} of {total}. Work through these to see the rest, or open the All Rentals view.
                        </p>
                    )}
                </CardContent>
            </Card>

            <ApproveRentalDialog
                open={isActionOpen('approve')}
                onOpenChange={handleOpenChange}
                item={selectedItem}
                onApprove={handleApproveConfirm}
                isLoading={actionInProgress !== null}
            />

            <ProcessPickupDialog
                open={isActionOpen('pickup')}
                onOpenChange={handleOpenChange}
                item={selectedItem}
                onConfirm={(rentalId: number, notes?: string) => onPickup?.(rentalId, notes)}
                isLoading={actionInProgress !== null}
            />

            <ProcessReturnDialog
                open={isActionOpen('return')}
                onOpenChange={handleOpenChange}
                item={selectedItem}
                onConfirm={(rentalId: number, data?: ProcessReturnData) => onReturn?.(rentalId, data)}
                onReportDamage={(rentalId) => {
                    setDamageRentalId(rentalId);
                    setDamageDialogOpen(true);
                    setDialogState({ ...dialogState, open: false });
                }}
                isLoading={actionInProgress !== null}
            />

            <RejectRentalDialog
                open={isActionOpen('reject')}
                onOpenChange={handleOpenChange}
                item={selectedItem}
                onReject={handleRejectConfirm}
                isLoading={actionInProgress !== null}
            />

            {damageRentalId && (
                <DamageReportForm
                    rentalId={damageRentalId}
                    open={damageDialogOpen}
                    onOpenChange={setDamageDialogOpen}
                    onSuccess={() => setDamageRentalId(null)}
                />
            )}
        </>
    );
});
