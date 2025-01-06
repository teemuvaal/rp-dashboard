'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { fetchSessionNotes, saveSummary } from "@/app/dashboard/actions";
import { createSummary } from "@/app/dashboard/aiactions";
import { useRouter } from 'next/navigation';

export default function SessionSummary({ session }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const router = useRouter();

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Fetch notes linked to this session
            const result = await fetchSessionNotes(session.id);
            
            if (result.error) {
                setError(result.error);
                return;
            }

            if (!result.notes || result.notes.length === 0) {
                setError('No notes found for this session');
                return;
            }

            // Create a summary from the notes
            const summaryResult = await createSummary({ notes: result.notes });
            
            if (summaryResult.error) {
                setError(summaryResult.error);
                return;
            }

            // Save the summary to the database
            const saveResult = await saveSummary({
                sessionId: session.id,
                content: summaryResult.cleanedNote
            });

            if (saveResult.error) {
                setError(saveResult.error);
                return;
            }

            setSummary(summaryResult.cleanedNote);
            router.refresh();

        } catch (err) {
            setError('Failed to generate summary');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Session Summary</CardTitle>
                        <CardDescription>
                            Generate a summary from all notes linked to this session
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        className="gap-2"
                    >
                        <Wand2 className="h-4 w-4" />
                        {isGenerating ? 'Generating...' : 'Generate Summary'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <p className="text-sm text-red-500 mb-4">{error}</p>
                )}
                {summary ? (
                    <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: summary }}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Click the button above to generate a summary from all notes linked to this session.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}