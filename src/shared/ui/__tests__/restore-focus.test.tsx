import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('focus restoration when the opener disappears', () => {
    it('falls back to the page heading', async () => {
        const user = userEvent.setup();

        function Page() {
            const [open, setOpen] = useState(false);
            const [done, setDone] = useState(false);

            return (
                <main>
                    <h1>Page title</h1>
                    {!done && <button onClick={() => setOpen(true)}>Do it</button>}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogTitle>Title</DialogTitle>
                            <DialogDescription>Body</DialogDescription>
                            <button
                                onClick={() => {
                                    setDone(true);
                                    setOpen(false);
                                }}
                            >
                                Confirm
                            </button>
                        </DialogContent>
                    </Dialog>
                </main>
            );
        }

        render(<Page />);
        screen.getByRole('button', { name: 'Do it' }).focus();
        await user.keyboard('{Enter}');
        await user.click(await screen.findByRole('button', { name: 'Confirm' }));

        await waitFor(() => expect(screen.getByRole('heading', { name: 'Page title' })).toHaveFocus());
    });
});
