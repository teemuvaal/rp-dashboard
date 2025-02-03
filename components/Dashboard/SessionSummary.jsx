'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateNarrativeSummary, generateNarrationAudio, createSummary } from "@/app/dashboard/aiactions";
import { fetchSessionNotes, saveSummary } from "@/app/dashboard/actions";
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Volume2 } from "lucide-react";
import VisualSummary from "@/components/Dashboard/VisualSummary";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SessionSummary({ session }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(session?.summary || '');
    const [narrativeSummary, setNarrativeSummary] = useState(session?.narrative_summary || '');
    const [audioUrl, setAudioUrl] = useState(session?.audio_url || '');
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const router = useRouter();

    if (!session?.id) {
        return <div>Error: Invalid session data</div>;
    }

    // Load existing summary when component mounts
    useEffect(() => {
        const supabase = createClient();
        const loadExistingSummary = async () => {
            try {
                const { data: summaryData, error } = await supabase
                    .from('session_summaries')
                    .select('content')
                    .eq('session_id', session.id)
                    .single();

                if (!error && summaryData) {
                    setSummary(summaryData.content);
                }
            } catch (error) {
                console.error('Error loading summary:', error);
            }
        };

        if (session.id) {
            loadExistingSummary();
        }
    }, [session.id]);

    const handleGenerateSummary = async () => {
        setLoading(true);
        try {
            // Fetch all notes for this session
            const { notes } = await fetchSessionNotes(session.id);
            
            if (!notes || !Array.isArray(notes) || notes.length === 0) {
                throw new Error('No notes found for this session');
            }

            // Combine all note contents
            const combinedNotes = notes.map(note => note.content || '').join('\n\n');

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
            setSummary(generatedSummary);
            
            toast({
                title: "Summary generated",
                description: "The session summary has been created successfully.",
            });

            router.refresh();
        } catch (err) {
            console.error('Error generating summary:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to generate summary. Please try again.",
            });
        } finally {
            setLoading(false);
        }
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
            if (result.error) {
                toast({
                    title: "Error",
                    description: `Error generating narrative: ${result.error}`,
                    variant: "destructive",
                });
                return;
            }
            setNarrativeSummary(result.content);
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
            if (result.error) {
                toast({
                    title: "Error",
                    description: `Error generating audio: ${result.error}`,
                    variant: "destructive",
                });
                return;
            }
            setAudioUrl(result.audioUrl);
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
                        <Button 
                            onClick={handleGenerateSummary} 
                            disabled={loading}
                            size="sm"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {loading ? "Generating..." : (summary ? "Regenerate Summary" : "Generate Summary")}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {summary ? (
                        <div className="space-y-4">
                            <p className="whitespace-pre-wrap">{summary}</p>
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleGenerateNarrative}
                                    disabled={loading}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
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
                            >
                                <Volume2 className="h-4 w-4 mr-2" />
                                {isGeneratingAudio ? "Generating..." : "Generate Audio"}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="whitespace-pre-wrap">{narrativeSummary}</p>
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
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}