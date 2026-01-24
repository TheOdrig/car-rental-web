'use client';

import { useState } from 'react';
import { MessageSquare, Plus, User, Clock, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddAdminNote } from '@/lib/hooks/use-admin';
import { safeFormatDate } from '@/lib/utils/format';
import type { AdminNote } from '@/types';

interface CustomerNotesCardProps {
    customerId: number;
    notes: AdminNote[];
    onNoteAdded?: () => void;
}

export function CustomerNotesCard({ customerId, notes, onNoteAdded }: CustomerNotesCardProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [noteText, setNoteText] = useState('');
    const addNote = useAddAdminNote();

    const handleSubmit = () => {
        if (!noteText.trim() || noteText.length < 3) return;

        addNote.mutate(
            { userId: customerId, text: noteText.trim() },
            {
                onSuccess: () => {
                    setNoteText('');
                    setIsAdding(false);
                    onNoteAdded?.();
                },
            }
        );
    };

    const sortedNotes = [...(notes || [])].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="h-5 w-5 text-amber-500" />
                        Admin Notes
                    </CardTitle>
                    {!isAdding && (
                        <Button variant="admin-outline" size="sm" onClick={() => setIsAdding(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Note
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isAdding && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                        <Textarea
                            placeholder="Enter admin note (min 3, max 1000 characters)..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="mb-3 min-h-[100px]"
                            maxLength={1000}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
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
                    <div className="text-center py-8">
                        <MessageSquare className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No admin notes yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedNotes.map((note) => (
                            <div
                                key={note.id}
                                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                            {note.adminName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="h-3 w-3" />
                                        {safeFormatDate(note.timestamp, 'datetime')}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
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
