'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { extractSummaryHighlights, generateHighlightImages } from "@/app/dashboard/aiactions";
import { saveVisualSummary, fetchVisualSummary } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';

export default function VisualSummary({ session, sessionSummary }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [highlights, setHighlights] = useState([]);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [imagePrompts, setImagePrompts] = useState([]);
    const [currentStep, setCurrentStep] = useState('initial'); // 'initial', 'extracting', 'generating', 'complete'
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const loadVisualSummary = async () => {
            const { visualSummary, error } = await fetchVisualSummary(session.id);
            if (!error && visualSummary) {
                setHighlights(visualSummary.highlights || []);
                setGeneratedImages(visualSummary.image_urls || []);
                setImagePrompts(visualSummary.image_prompts || []);
                setCurrentStep('complete');
            }
        };
        loadVisualSummary();
    }, [session.id]);

    const handleGenerateVisualSummary = async () => {
        if (!sessionSummary?.content) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please generate a session summary first.",
            });
            return;
        }

        setIsGenerating(true);
        setCurrentStep('extracting');
        
        try {
            // Step 1: Extract highlights from the summary
            const { success, highlights: extractedHighlights, error } = await extractSummaryHighlights(sessionSummary.content);
            
            if (!success || !extractedHighlights) {
                throw new Error(error || 'Failed to extract highlights');
            }

            setHighlights(extractedHighlights);
            
            toast({
                title: "Highlights extracted",
                description: "Generating images from the highlights...",
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

            // Save the visual summary
            const { success: saveSuccess, error: saveError } = await saveVisualSummary({
                sessionId: session.id,
                summaryId: sessionSummary.id,
                highlights: extractedHighlights,
                imageUrls,
                imagePrompts: prompts.map(prompt => typeof prompt === 'string' ? prompt : JSON.stringify(prompt))
            });

            if (!saveSuccess) {
                throw new Error(saveError || 'Failed to save visual summary');
            }

            toast({
                title: "Visual summary ready",
                description: "Images have been generated and saved successfully.",
            });

            router.refresh();

        } catch (error) {
            console.error('Error generating visual summary:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to generate visual summary. Please try again.",
            });
            setCurrentStep('initial');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Visual Summary</CardTitle>
                        <CardDescription>
                            {highlights.length > 0 
                                ? 'Visual representation of key moments'
                                : 'Generate visual representations of key moments'}
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleGenerateVisualSummary}
                        disabled={isGenerating || !sessionSummary?.content}
                        className="gap-2"
                    >
                        <Wand2 className="h-4 w-4" />
                        {isGenerating ? (
                            currentStep === 'extracting' ? 'Extracting highlights...' :
                            currentStep === 'generating' ? 'Generating images...' :
                            'Processing...'
                        ) : highlights.length > 0 ? 'Regenerate Visual Summary' : 'Generate Visual Summary'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Display highlights and generated images */}
                {highlights.length > 0 && (
                    <div className="space-y-6">
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