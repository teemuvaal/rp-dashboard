'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Lock } from "lucide-react";
import { 
    handleGenerateVisualSummary as generateVisualSummaryData,
    handleGenerateBasicVisualSummary as generateBasicVisualSummaryData
} from "@/app/dashboard/aiactions";
import { fetchVisualSummary } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';
import StoryViewer from './StoryViewer';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

// Utility function to extract JSON from markdown code blocks or raw JSON strings
function extractJsonFromMarkdown(text) {
    if (!text) return null;
    
    // First, try parsing the text directly as JSON
    try {
        return JSON.parse(text);
    } catch (e) {
        // Not valid JSON, continue with extraction
    }

    // Try to extract JSON from markdown code blocks
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(codeBlockRegex);
    
    if (match && match[1]) {
        try {
            return JSON.parse(match[1].trim());
        } catch (e) {
            console.error("Failed to parse extracted content as JSON:", e);
        }
    }
    
    // Try to find array or object notation directly
    const jsonRegex = /(\[[\s\S]*\]|\{[\s\S]*\})/;
    const jsonMatch = text.match(jsonRegex);
    
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1].trim());
        } catch (e) {
            console.error("Failed to parse JSON notation:", e);
        }
    }
    
    throw new Error("Could not extract valid JSON from the text");
}

const artStyles = [
    { value: "80s fantasy book cover", label: "80s Fantasy Book Cover" },
    { value: "realistic", label: "Realistic" },
    { value: "watercolor", label: "Watercolor" },
    { value: "oil-painting in the renaissance style", label: "Oil Painting" },
    { value: "digital-art", label: "Digital Art" },
    { value: "high detail 64bit pixel-art", label: "Pixel Art" },
];

export default function VisualSummary({ session, sessionSummary, hasAudioAccess = false, isOwner }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState('initial');
    const [selectedStyle, setSelectedStyle] = useState("fantasy");
    const [visualSummary, setVisualSummary] = useState(null);
    const [error, setError] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [images, setImages] = useState([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [visualSummaryId, setVisualSummaryId] = useState(null);
    const { toast } = useToast();
    const router = useRouter();

    // Clear error when starting generation or changing style
    useEffect(() => {
        if (error) setError(null);
    }, [isGenerating, selectedStyle]);

    useEffect(() => {
        const loadVisualSummary = async () => {
            const { visualSummary: loadedSummary, error } = await fetchVisualSummary(session.id);
            if (!error && loadedSummary) {
                setVisualSummary(loadedSummary);
                setCurrentStep('complete');
            }
        };
        loadVisualSummary();
    }, [session.id]);

    const handleGenerateClick = async () => {
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
        setError(null); // Clear any previous errors
        
        try {
            console.log('Starting visual summary generation...');
            
            // Call the appropriate API function based on audio feature access
            const generateFunction = hasAudioAccess ? generateVisualSummaryData : generateBasicVisualSummaryData;
            const response = await generateFunction(
                session.id,
                sessionSummary.id,
                sessionSummary.content,
                selectedStyle
            );
            
            console.log('API response:', response);

            if (!response.success) {
                throw new Error(response.error || "Failed to generate visual summary");
            }
            
            // Ensure we have a data property
            let summaryData = response.data;
            if (!summaryData) {
                console.warn('No data property in response, using response as data');
                summaryData = response;
            }
            
            console.log('Processing summary data:', summaryData);
            
            // Process highlights if they exist in the response
            if (summaryData.highlights) {
                try {
                    // Check if highlights is a string and needs parsing
                    let highlightsData = summaryData.highlights;
                    if (typeof highlightsData === 'string') {
                        console.log('Parsing highlights string:', highlightsData);
                        highlightsData = extractJsonFromMarkdown(highlightsData);
                    }
                    
                    console.log('Processed highlights:', highlightsData);
                    setHighlights(Array.isArray(highlightsData) ? highlightsData : []);
                } catch (err) {
                    console.error("Error extracting highlights:", err);
                    setError(`Error extracting highlights: ${err.message}`);
                    setHighlights([]);
                }
            } else {
                console.warn('No highlights found in response');
                setHighlights([]);
            }
            
            // Set images if available
            if (summaryData.imageUrls) {
                console.log('Setting image URLs:', summaryData.imageUrls);
                setImages(summaryData.imageUrls);
            }
            
            // Set audio URL if available
            if (summaryData.audioUrl) {
                console.log('Setting audio URL:', summaryData.audioUrl);
                setAudioUrl(summaryData.audioUrl);
            }
            
            // Update local state to show the visual summary
            if (summaryData.id) {
                setVisualSummaryId(summaryData.id);
            }
            
            setVisualSummary(summaryData);
            setCurrentStep('complete');
            
            toast({
                title: "Success",
                description: "Your story has been created successfully.",
            });
            
            router.refresh();
        } catch (err) {
            console.error("Failed to generate visual summary:", err);
            setError(err.message || "Failed to generate visual summary");
            setCurrentStep('initial');
            
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to generate visual summary",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {isOwner && (
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <Select
                        value={selectedStyle}
                        onValueChange={setSelectedStyle}
                        disabled={isGenerating}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select art style" />
                        </SelectTrigger>
                        <SelectContent>
                            {artStyles.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                    {style.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {!hasAudioAccess && (
                        <HoverCard>
                            <HoverCardTrigger>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                    <span>Audio Narration Locked</span>
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent>
                                <div className="text-sm">
                                    <p>Upgrade to Pro to unlock audio narration for your stories!</p>
                                    <p className="text-muted-foreground mt-1">
                                        Free users can still generate visual summaries without narration.
                                    </p>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>

                <Button
                    variant="outline"
                    onClick={handleGenerateClick}
                    disabled={isGenerating || !sessionSummary?.content}
                    className="gap-2"
                >
                    <Wand2 className="h-4 w-4" />
                    {isGenerating ? (
                        currentStep === 'extracting' ? 'Extracting highlights...' :
                        currentStep === 'generating' ? 'Generating images...' :
                        currentStep === 'narrating' ? 'Creating narrative...' :
                        'Processing...'
                    ) : visualSummary ? 'Regenerate Story' : 'Generate Story'}
                </Button>
                </div>
            )}

            {visualSummary && currentStep === 'complete' && (
                <StoryViewer visualSummary={visualSummary} />
            )}
        </div>
    );
} 