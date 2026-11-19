import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui/alert-dialog';

describe('dialog content containment', () => {
    it('lets grid children shrink and keeps the dialog inside the viewport', () => {
        render(
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dispute</DialogTitle>
                        <DialogDescription>Describe the problem</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog.className).toContain('[&>*]:min-w-0');
        expect(dialog.className).toContain('max-w-[calc(100vw-2rem)]');
        expect(dialog.className).toContain('overflow-y-auto');
    });

    it('applies the same containment to alert dialogs', () => {
        render(
            <AlertDialog open>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel</AlertDialogTitle>
                        <AlertDialogDescription>Sure?</AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        );

        expect(screen.getByRole('alertdialog').className).toContain('[&>*]:min-w-0');
    });
});
