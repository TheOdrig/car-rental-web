'use client';

import { useState } from 'react';
import { MessageSquare, Plus, User, Clock, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { EmptyState } from '@/shared/ui/empty-state';
import { useAddAdminNote } from '../../api/users-api';
import { formatDateTime } from '@/shared/lib';
import { useSingleFlight } from '@/shared/lib/use-single-flight';
import type { AdminNote } from '@/entities/user';

interface CustomerNotesCardProps {
    customerId: number;
    notes: AdminNote[];
    onNoteAdded?: () => void;
}

export function CustomerNotesCard({ customerId, notes, onNoteAdded }: CustomerNotesCardProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [noteText, setNoteText] = useState('');
    const addNote = useAddAdminNote();
    const singleFlight = useSingleFlight();

    const handleSubmit = () => {
        if (!noteText.trim() || noteText.length < 3) return;

        void singleFlight(async () => {
            try {
                await addNote.mutateAsync({ userId: customerId, text: noteText.trim() });
            } catch {
                return;
            }
            setNoteText('');
            setIsAdding(false);
            onNoteAdded?.();
        });
    };

    const sortedNotes = [...(notes || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        Admin Notes
                    </CardTitle>
                    {!isAdding && (
                        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Note
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isAdding && (
                    <div className="border border-border rounded-lg p-4 bg-raised">
                        <Textarea
                            placeholder="Enter admin note (min 3, max 1000 characters)..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="mb-3 min-h-[100px]"
                            maxLength={1000}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                {noteText.length}/1000 characters
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setIsAdding(false); setNoteText(''); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={noteText.length < 3 || addNote.isPending}
                                >
                                    <Send className="h-4 w-4 mr-1" />
                                    {addNote.isPending ? 'Saving...' : 'Save Note'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {sortedNotes.length === 0 ? (
                    <EmptyState size="compact" icon={MessageSquare} title="No admin notes yet" />
                ) : (
                    <div className="space-y-3">
                        {sortedNotes.map((note) => (
                            <div
                                key={note.id}
                                className="border border-border rounded-lg p-4 bg-card"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium text-foreground">
                                            {note.adminUsername}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatDateTime(note.createdAt)}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {note.text}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}