'use client';

import { Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { Rental } from '@/entities/rental';

interface RentalNotesCardProps {
    rental: Pick<Rental, 'approvalNotes' | 'pickupNotes' | 'returnNotes' | 'notes'>;
}

interface NoteBlockProps {
    label: string;
    text: string;
    tone: 'green' | 'purple' | 'slate';
}

const TONES: Record<NoteBlockProps['tone'], { box: string; label: string; text: string }> = {
    green: {
        box: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        label: 'text-green-700 dark:text-green-300',
        text: 'text-green-600 dark:text-green-400',
    },
    purple: {
        box: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
        label: 'text-purple-700 dark:text-purple-300',
        text: 'text-purple-600 dark:text-purple-400',
    },
    slate: {
        box: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700',
        label: 'text-slate-700 dark:text-slate-300',
        text: 'text-slate-600 dark:text-slate-400',
    },
};

function NoteBlock({ label, text, tone }: NoteBlockProps) {
    const classes = TONES[tone];

    return (
        <div className={`rounded-lg border p-3 ${classes.box}`}>
            <p className={`mb-1 text-sm font-medium ${classes.label}`}>{label}</p>
            <p className={`break-words text-sm ${classes.text}`}>{text}</p>
        </div>
    );
}

export function hasRentalNotes(rental: RentalNotesCardProps['rental']): boolean {
    return !!(rental.notes || rental.approvalNotes || rental.pickupNotes || rental.returnNotes);
}

export function RentalNotesCard({ rental }: RentalNotesCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Edit className="h-5 w-5" aria-hidden="true" />
                    Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {rental.notes && <NoteBlock label="Your Booking Note" text={rental.notes} tone="slate" />}
                {rental.approvalNotes && <NoteBlock label="Approval Note" text={rental.approvalNotes} tone="green" />}
                {rental.pickupNotes && <NoteBlock label="Pickup Note" text={rental.pickupNotes} tone="purple" />}
                {rental.returnNotes && <NoteBlock label="Return Note" text={rental.returnNotes} tone="slate" />}
            </CardContent>
        </Card>
    );
}
