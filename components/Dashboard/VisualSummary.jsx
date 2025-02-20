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

const artStyles = [
    { value: "80s fantasy book cover", label: "80s Fantasy Book Cover" },
    { value: "realistic", label: "Realistic" },
    { value: "watercolor", label: "Watercolor" },
    { value: "oil-painting in the renaissance style", label: "Oil Painting" },
    { value: "digital-art", label: "Digital Art" },
    { value: "high detail 64bit pixel-art", label: "Pixel Art" },
];

export default function VisualSummary({ session, sessionSummary, hasAudioAccess = false }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState('initial');
    const [selectedStyle, setSelectedStyle] = useState("fantasy");
    const [visualSummary, setVisualSummary] = useState(null);
    const { toast } = useToast();
    const router = useRouter();

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
        
        try {
            const generateFunction = hasAudioAccess ? generateVisualSummaryData : generateBasicVisualSummaryData;
            const { success, data, error } = await generateFunction(
                session.id,
                sessionSummary.id,
                sessionSummary.content,
                selectedStyle
            );

            if (!success) {
                throw new Error(error);
            }

            setVisualSummary(data);
            setCurrentStep('complete');

            toast({
                title: "Success",
                description: "Your story has been created successfully.",
            });

            router.refresh();
        } catch (error) {
            console.error('Error generating visual summary:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to generate visual summary",
            });
            setCurrentStep('initial');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
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

            {visualSummary && currentStep === 'complete' && (
                <StoryViewer visualSummary={visualSummary} />
            )}
        </div>
    );
} 