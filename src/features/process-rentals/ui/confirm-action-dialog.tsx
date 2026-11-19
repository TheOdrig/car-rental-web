'use client';

import type { ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

interface ConfirmActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    pendingLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    isPending?: boolean;
    confirmDisabled?: boolean;
    children?: ReactNode;
    onConfirm: () => void;
}

export function ConfirmActionDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    pendingLabel,
    cancelLabel = 'Keep As Is',
    destructive = false,
    isPending = false,
    confirmDisabled = false,
    children,
    onConfirm,
}: ConfirmActionDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                    {children}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending || confirmDisabled}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                        className={destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
                    >
                        {isPending ? pendingLabel ?? 'Working...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
