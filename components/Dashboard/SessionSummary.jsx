'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Wand2, Save, X } from "lucide-react";
import { fetchSessionNotes, saveSummary, fetchSummary } from "@/app/dashboard/actions";
import { createSummary, extractSummaryHighlights } from "@/app/dashboard/aiactions";
import { useRouter } from 'next/navigation';
import { ForwardRefEditor } from '@/utils/mdxeditor/ForwardRefEditor';
import { useToast } from "@/components/ui/use-toast"

export default function SessionSummary({ session }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedSummary, setEditedSummary] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [imagePrompts, setImagePrompts] = useState([]);
    const [currentStep, setCurrentStep] = useState('initial'); // 'initial', 'extracting', 'generating', 'complete'
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const loadSummary = async () => {
            const result = await fetchSummary(session.id);
            if (!result.error && result.summary?.content) {
                setSummary(result.summary.content);
                setEditedSummary(result.summary.content);
            }
        };
        loadSummary();
    }, [session.id]);

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

            // Update local state immediately
            setSummary(summaryResult.cleanedNote);
            setEditedSummary(summaryResult.cleanedNote);
            
            // Refresh both the current page and the sessions route
            router.refresh();
            router.push(`/dashboard/${session.campaign_id}/sessions/${session.id}`);

        } catch (err) {
            setError('Failed to generate summary');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveSummary = async () => {
        try {
            const saveResult = await saveSummary({
                sessionId: session.id,
                content: editedSummary
            });

            if (saveResult.error) {
                setError(saveResult.error);
                return;
            }

            setSummary(editedSummary);
            setIsEditing(false);
            
            // Refresh both routes
            router.refresh();
            router.push(`/dashboard/${session.campaign_id}/sessions/${session.id}`);
        } catch (err) {
            setError('Failed to save summary');
        }
    };

    const handleCancelEdit = () => {
        setEditedSummary(summary);
        setIsEditing(false);
    };

    const handleGenerateVisualSummary = async () => {
        setIsGenerating(true);
        setCurrentStep('extracting');
        
        try {
            // Step 1: Extract highlights from the summary
            const { success, highlights: extractedHighlights, error } = await extractSummaryHighlights(summary);
            
            if (!success || !extractedHighlights) {
                throw new Error(error || 'Failed to extract highlights');
            }

            setHighlights(extractedHighlights);
            
            toast({
                title: "Highlights extracted!",
                description: "Generating images...",
            });

            // Step 2: Generate images from highlights
            setCurrentStep('generating');
            const { success: imageSuccess, imageUrls, prompts, error: imageError } = 
                await generateHighlightImages(extractedHighlights, session.id);

            if (!imageSuccess) {
                throw new Error(imageError || 'Failed to generate images');
            }

            setGeneratedImages(imageUrls);
            setImagePrompts(prompts);
            setCurrentStep('complete');

            toast({
                title: "Images generated!",
                description: "Visual summary is ready.",
            });

            // TODO: Next steps
            // 1. Convert summary to speech
            // 2. Create visual presentation

        } catch (error) {
            console.error('Error generating visual summary:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to generate visual summary. Please try again.",
                variant: "destructive",
            });
            setCurrentStep('initial');
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
                            {summary ? 'View and edit the summary for this session' : 'Generate a summary from all notes linked to this session'}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {summary && !isEditing && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleGenerateVisualSummary}
                                    disabled={isGenerating}
                                    className="gap-2"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    {isGenerating ? (
                                        currentStep === 'extracting' ? 'Extracting highlights...' :
                                        currentStep === 'generating' ? 'Generating images...' :
                                        'Processing...'
                                    ) : 'Generate Visual Summary'}
                                </Button>
                            </>
                        )}
                        {!summary && (
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
                {summary ? (
                    <div className="space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                            <ForwardRefEditor
                                markdown={isEditing ? editedSummary : summary}
                                onChange={isEditing ? setEditedSummary : undefined}
                                readOnly={!isEditing}
                            />
                        </div>
                        {isEditing && (
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveSummary}
                                    className="gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Click the button above to generate a summary from all notes linked to this session.
                    </p>
                )}

                {/* Display highlights and generated images */}
                {highlights.length > 0 && (
                    <div className="mt-6 space-y-6">
                        <h3 className="text-lg font-semibold">Visual Summary</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {highlights.map((highlight, index) => (
                                <div key={index} className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{highlight}</p>
                                    {generatedImages[index] && (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={generatedImages[index]}
                                                alt={`Generated scene ${index + 1}`}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    {imagePrompts[index] && (
                                        <p className="text-xs text-muted-foreground">
                                            Prompt: {imagePrompts[index]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}