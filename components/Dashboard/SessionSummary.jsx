'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateNarrativeSummary, generateNarrationAudio, createSummary } from "@/app/dashboard/aiactions";
import { fetchSessionNotes, saveSummary, fetchSummary } from "@/app/dashboard/actions";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Volume2, Edit, X, Check } from "lucide-react";
import { useRouter } from 'next/navigation';
import VisualSummary from "@/components/Dashboard/VisualSummary";
import ReactMarkdown from 'react-markdown';

export default function SessionSummary({ session, hasAudioAccess = false, isOwner = false }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [editedSummary, setEditedSummary] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [narrativeSummary, setNarrativeSummary] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const loadSummary = async () => {
            const result = await fetchSummary(session.id);
            if (!result.error && result.summary?.content) {
                setSummary(result.summary.content);
                setEditedSummary(result.summary.content);
            }
        };
        if (session?.id) {
            loadSummary();
        }
    }, [session?.id]);

    const handleGenerateSummary = async () => {
        setLoading(true);
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

            // Extract just the note contents
            const noteContents = result.notes.reduce((acc, note) => {
                return acc + note.content + '\n\n';
            }, '');

            // Create a summary from the notes
            const summaryResult = await createSummary({ notes: noteContents });
            
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

            // Update local state immediately
            setSummary(summaryResult.cleanedNote);
            setEditedSummary(summaryResult.cleanedNote);
            
            // Refresh both the current page and the sessions route
            router.refresh();
            router.push(`/dashboard/${session.campaign_id}/sessions/${session.id}`);

        } catch (err) {
            setError('Failed to generate summary');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSummary = async () => {
        try {
            const saveResult = await saveSummary({
                sessionId: session.id,
                content: editedSummary
            });

            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Failed to save summary');
            }

            setSummary(editedSummary);
            setIsEditing(false);
            
            toast({
                title: "Success",
                description: "Summary saved successfully.",
            });

            router.refresh();
        } catch (err) {
            console.error('Error saving summary:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to save summary",
            });
        }
    };

    const handleCancelEdit = () => {
        setEditedSummary(summary);
        setIsEditing(false);
    };

    const handleGenerateNarrative = async () => {
        if (!summary) {
            toast({
                title: "Error",
                description: "Please generate a summary first",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const result = await generateNarrativeSummary(summary, session.id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to generate narrative summary');
            }
            setNarrativeSummary(result.content);
            toast({
                title: "Success",
                description: "Narrative summary generated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Error generating narrative: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAudio = async () => {
        if (!narrativeSummary) {
            toast({
                title: "Error",
                description: "Please generate a narrative summary first",
                variant: "destructive",
            });
            return;
        }

        setIsGeneratingAudio(true);
        try {
            const result = await generateNarrationAudio(narrativeSummary);
            if (!result.success) {
                throw new Error(result.error || 'Failed to generate audio');
            }
            setAudioUrl(result.audioUrl);
            toast({
                title: "Success",
                description: "Audio generated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Error generating audio: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Session Summary</span>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button 
                                        onClick={handleSaveSummary} 
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Check className="h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button 
                                        onClick={handleCancelEdit}
                                        variant="outline" 
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {summary && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    )}
                                    {isOwner && (
                                        <Button 
                                            onClick={handleGenerateSummary} 
                                            disabled={loading}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                            {loading ? "Generating..." : (summary ? "Regenerate Summary" : "Generate Summary")}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <p className="text-destructive mb-4">{error}</p>
                    )}
                    {isEditing ? (
                        <textarea
                            value={editedSummary}
                            onChange={(e) => setEditedSummary(e.target.value)}
                            className="w-full min-h-[200px] p-4 rounded-md border"
                        />
                    ) : summary ? (
                        <div className="space-y-4">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{summary}</ReactMarkdown>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleGenerateNarrative}
                                    disabled={loading}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {loading ? "Generating..." : "Generate Narrative Version"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No summary generated yet.</p>
                    )}
                </CardContent>
            </Card>

            {narrativeSummary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Narrative Summary</span>
                            <Button
                                onClick={handleGenerateAudio}
                                disabled={isGeneratingAudio}
                                size="sm"
                                className="gap-2"
                            >
                                <Volume2 className="h-4 w-4" />
                                {isGeneratingAudio ? "Generating..." : "Generate Audio"}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{narrativeSummary}</ReactMarkdown>
                        </div>
                        {audioUrl && (
                            <div className="mt-4">
                                <audio controls className="w-full">
                                    <source src={audioUrl} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {summary && (
                <Card>
                    <CardHeader>
                        <CardTitle>Visual Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VisualSummary 
                            session={session}
                            sessionSummary={{ id: session.id, content: summary }}
                            hasAudioAccess={hasAudioAccess}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}