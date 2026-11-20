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
        box: 'bg-success-subtle border-success-subtle-foreground/30',
        label: 'text-success-subtle-foreground',
        text: 'text-success-subtle-foreground',
    },
    purple: {
        box: 'bg-info-subtle border-info-subtle-foreground/30',
        label: 'text-info-subtle-foreground',
        text: 'text-info-subtle-foreground',
    },
    slate: {
        box: 'bg-raised border-border',
        label: 'text-muted-foreground',
        text: 'text-muted-foreground',
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
