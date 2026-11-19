import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '../alert-dialog';

function ControlledDialog() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open dialog</button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>Title</DialogTitle>
                    <DialogDescription>Body</DialogDescription>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ControlledAlert() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open alert</button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogTitle>Title</AlertDialogTitle>
                    <AlertDialogDescription>Body</AlertDialogDescription>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

describe('focus restoration for controlled dialogs', () => {
    it('returns focus to the button that opened a controlled dialog', async () => {
        const user = userEvent.setup();
        render(<ControlledDialog />);

        const trigger = screen.getByRole('button', { name: 'Open dialog' });
        trigger.focus();
        await user.keyboard('{Enter}');
        expect(await screen.findByRole('dialog')).toBeInTheDocument();

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it('returns focus to the button that opened a controlled alert dialog', async () => {
        const user = userEvent.setup();
        render(<ControlledAlert />);

        const trigger = screen.getByRole('button', { name: 'Open alert' });
        trigger.focus();
        await user.keyboard('{Enter}');
        expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });
});
