'use client';

import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateNote } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";

export default function LinkNoteToSession({ availableNotes, sessionId, campaignId }) {
    const [selectedNoteId, setSelectedNoteId] = useState('none');
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLink = async () => {
        if (!selectedNoteId || selectedNoteId === 'none') return;

        setIsLinking(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('noteId', selectedNoteId);
            formData.append('sessionId', sessionId);

            const result = await updateNote(formData);
            if (result.success) {
                setSelectedNoteId('none');
                router.refresh();
            } else {
                setError(result.error || 'Failed to link note');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Select value={selectedNoteId} onValueChange={setSelectedNoteId}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select a note to link" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Select a note...</SelectItem>
                        {availableNotes.map(note => (
                            <SelectItem key={note.id} value={note.id}>
                                <div className="flex flex-col">
                                    <span>{note.title}</span>
                                    <span className="text-xs text-gray-500">
                                        By {note.users.username} • {note.is_public ? 'Public' : 'Private'}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button 
                    onClick={handleLink} 
                    disabled={!selectedNoteId || selectedNoteId === 'none' || isLinking}
                >
                    {isLinking ? 'Linking...' : 'Link Note'}
                </Button>
            </div>
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
} 