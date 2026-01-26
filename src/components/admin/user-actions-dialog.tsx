'use client';

import React, { useState } from 'react';
import { AlertTriangle, Ban, UserCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface BanUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    onConfirm: (reason: string) => void;
    isLoading?: boolean;
}

export function BanUserDialog({
    open,
    onOpenChange,
    userName,
    onConfirm,
    isLoading = false,
}: BanUserDialogProps) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason.trim());
            setReason('');
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setReason('');
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <DialogTitle>Ban User</DialogTitle>
                            <DialogDescription>
                                This action will prevent {userName} from accessing their account.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            The user will be logged out immediately and won&apos;t be able to log in until unbanned.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ban-reason">Reason for ban *</Label>
                        <Textarea
                            id="ban-reason"
                            placeholder="Enter the reason for banning this user..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            This reason will be stored and visible to admins.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading || !reason.trim()}
                    >
                        {isLoading ? 'Banning...' : 'Ban User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface UnbanUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    banReason?: string;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function UnbanUserDialog({
    open,
    onOpenChange,
    userName,
    banReason,
    onConfirm,
    isLoading = false,
}: UnbanUserDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <DialogTitle>Unban User</DialogTitle>
                            <DialogDescription>
                                This will restore {userName}&apos;s access to their account.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {banReason && (
                    <div className="space-y-2 py-4">
                        <Label className="text-muted-foreground">Original ban reason:</Label>
                        <p className="rounded-lg border bg-muted/50 p-3 text-sm">
                            {banReason}
                        </p>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isLoading ? 'Unbanning...' : 'Unban User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

