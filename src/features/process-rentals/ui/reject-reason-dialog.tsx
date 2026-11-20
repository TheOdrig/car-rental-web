'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { REJECT_COPY } from '../lib/admin-rental-detail';

interface RejectReasonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reason: string;
    onReasonChange: (reason: string) => void;
    onConfirm: () => void;
    isPending: boolean;
}

export function RejectReasonDialog({ open, onOpenChange, reason, onReasonChange, onConfirm, isPending }: RejectReasonDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{REJECT_COPY.title}</DialogTitle>
                    <DialogDescription>{REJECT_COPY.description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder={REJECT_COPY.placeholder}
                        value={reason}
                        onChange={(e) => onReasonChange(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {REJECT_COPY.dismiss}
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={!reason.trim() || isPending}>
                        {isPending ? REJECT_COPY.pending : REJECT_COPY.confirm}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
