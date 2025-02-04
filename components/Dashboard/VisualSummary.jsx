'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Play, X } from "lucide-react";
import { 
    extractSummaryHighlights, 
    generateHighlightImages, 
    generateNarrativeSummary, 
    generateNarrationAudio,
    handleGenerateVisualSummary as generateVisualSummaryData
} from "@/app/dashboard/aiactions";
import { saveVisualSummary, fetchVisualSummary } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';

const artStyles = [
    { value: "80s fantasy book cover", label: "80s Fantasy Book Cover" },
    { value: "realistic", label: "Realistic" },
    { value: "watercolor", label: "Watercolor" },
    { value: "oil-painting", label: "Oil Painting" },
    { value: "digital-art", label: "Digital Art" },
    { value: "pixel-art", label: "Pixel Art" },
];

export default function VisualSummary({ session, sessionSummary }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [highlights, setHighlights] = useState([]);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [imagePrompts, setImagePrompts] = useState([]);
    const [narrativeContent, setNarrativeContent] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [currentStep, setCurrentStep] = useState('initial');
    const [selectedStyle, setSelectedStyle] = useState("fantasy");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const loadVisualSummary = async () => {
            const { visualSummary, error } = await fetchVisualSummary(session.id);
            if (!error && visualSummary) {
                setHighlights(visualSummary.highlights || []);
                setGeneratedImages(visualSummary.image_urls || []);
                setImagePrompts(visualSummary.image_prompts || []);
                setNarrativeContent(visualSummary.narrative_content || '');
                setAudioUrl(visualSummary.audio_url || '');
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
            const { success, data, error } = await generateVisualSummaryData(
                session.id,
                sessionSummary.id,
                sessionSummary.content,
                selectedStyle
            );

            if (!success) {
                throw new Error(error);
            }

            setHighlights(data.highlights);
            setGeneratedImages(data.imageUrls);
            setImagePrompts(data.imagePrompts);
            setNarrativeContent(data.narrativeContent);
            setAudioUrl(data.audioUrl);
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

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleClose = () => {
        setIsPlaying(false);
        setCurrentSlideIndex(0);
    };

    // Auto-advance slides based on highlights length
    useEffect(() => {
        if (!isPlaying || !audioUrl) return;

        const interval = 8000; // 8 seconds per slide
        const timer = setInterval(() => {
            setCurrentSlideIndex(prev => {
                if (prev < highlights.length - 1) return prev + 1;
                setIsPlaying(false);
                return prev;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isPlaying, highlights.length, audioUrl]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <Select
                        value={selectedStyle}
                        onValueChange={setSelectedStyle}
                        disabled={isGenerating || isPlaying}
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
                </div>
                <div className="flex gap-4">
                    {currentStep === 'complete' && !isPlaying && (
                        <Button
                            variant="outline"
                            onClick={handlePlayPause}
                            className="gap-2"
                        >
                            <Play className="h-4 w-4" />
                            Play Story
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleGenerateClick}
                        disabled={isGenerating || !sessionSummary?.content || isPlaying}
                        className="gap-2"
                    >
                        <Wand2 className="h-4 w-4" />
                        {isGenerating ? (
                            currentStep === 'extracting' ? 'Extracting highlights...' :
                            currentStep === 'generating' ? 'Generating images...' :
                            currentStep === 'narrating' ? 'Creating narrative...' :
                            'Processing...'
                        ) : highlights.length > 0 ? 'Regenerate Story' : 'Generate Story'}
                    </Button>
                </div>
            </div>

            {isPlaying && currentStep === 'complete' && (
                <div className="fixed inset-0 z-50 bg-black">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:text-white/80"
                        onClick={handleClose}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlideIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="relative w-full h-full"
                        >
                            <div 
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${generatedImages[currentSlideIndex]})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="prose prose-invert prose-lg max-w-3xl mx-auto"
                                >
                                    <ReactMarkdown>
                                        {highlights[currentSlideIndex]}
                                    </ReactMarkdown>
                                </motion.div>
                            </div>
                            
                            {audioUrl && (
                                <audio
                                    src={audioUrl}
                                    autoPlay={isPlaying}
                                    onEnded={() => setIsPlaying(false)}
                                    className="hidden"
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
} 