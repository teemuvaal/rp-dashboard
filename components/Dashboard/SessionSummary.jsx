'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Save, X } from "lucide-react";
import { fetchSessionNotes, saveSummary, fetchSummary } from "@/app/dashboard/actions";
import { createSummary } from "@/app/dashboard/aiactions";
import { useRouter } from 'next/navigation';
import { ForwardRefEditor } from '@/utils/mdxeditor/ForwardRefEditor';
import VisualSummary from './VisualSummary';

export default function SessionSummary({ session }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [editedSummary, setEditedSummary] = useState(null);
    const [sessionSummary, setSessionSummary] = useState(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const loadSummary = async () => {
            const { summary, error } = await fetchSummary(session.id);
            if (!error && summary) {
                setSessionSummary(summary);
            }
        };
        loadSummary();
    }, [session.id]);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Fetch all notes for this session
            const { notes, error: notesError } = await fetchSessionNotes(session.id);
            if (notesError) throw new Error(notesError);

            if (!notes || notes.length === 0) {
                throw new Error('No notes found for this session');
            }

            // Combine all note contents
            const combinedNotes = notes.map(note => note.content).join('\n\n');

            // Generate summary using AI
            const { success, cleanedNote: generatedSummary, error: aiError } = 
                await createSummary({ notes: combinedNotes });

            if (!success || !generatedSummary) {
                throw new Error(aiError || 'Failed to generate summary');
            }

            // Save the summary
            const { success: saveSuccess, error: saveError } = 
                await saveSummary({ sessionId: session.id, content: generatedSummary });

            if (!saveSuccess) {
                throw new Error(saveError || 'Failed to save summary');
            }

            // Update local state
            setSessionSummary({ content: generatedSummary });
            
            toast({
                title: "Summary generated",
                description: "The session summary has been created successfully.",
            });

            router.refresh();
        } catch (err) {
            console.error('Error generating summary:', err);
            setError(err.message);
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to generate summary. Please try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveSummary = async () => {
        try {
            const { success, error } = await saveSummary({
                sessionId: session.id,
                content: editedSummary
            });

            if (!success) {
                throw new Error(error || 'Failed to save summary');
            }

            setSessionSummary({ content: editedSummary });
            setIsEditing(false);
            toast({
                title: "Summary saved",
                description: "Your changes have been saved successfully.",
            });
            router.refresh();
        } catch (err) {
            console.error('Error saving summary:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to save summary. Please try again.",
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Session Summary</CardTitle>
                            <CardDescription>
                                {sessionSummary?.content ? 'View and edit the summary for this session' : 'Generate a summary from session notes'}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {sessionSummary?.content && !isEditing && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </Button>
                            )}
                            {!sessionSummary?.content && (
                                <Button
                                    variant="outline"
                                    onClick={handleGenerateSummary}
                                    disabled={isGenerating}
                                    className="gap-2"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    {isGenerating ? 'Generating...' : 'Generate Summary'}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <p className="text-sm text-red-500 mb-4">{error}</p>
                    )}
                    {sessionSummary?.content ? (
                        <div className="space-y-4">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <ForwardRefEditor
                                        markdown={editedSummary || sessionSummary.content}
                                        onChange={setEditedSummary}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveSummary}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none">
                                    <ForwardRefEditor
                                        markdown={sessionSummary.content}
                                        readOnly={true}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Click the button above to generate a summary from all notes linked to this session.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Only show visual summary option if we have a text summary */}
            {sessionSummary?.content && (
                <VisualSummary session={session} sessionSummary={sessionSummary} />
            )}
        </>
    );
}