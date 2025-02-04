'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';

export default function StoryViewer({ visualSummary }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const audioRef = useRef(null);
    const highlights = visualSummary.highlights || [];
    const imageUrls = visualSummary.image_urls || [];
    const narrativeContent = visualSummary.narrative_content || '';

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentSlideIndex(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.pause();
        }
    };

    // Auto-advance slides based on audio progress
    useEffect(() => {
        if (!audioRef.current || !isPlaying) return;

        const duration = audioRef.current.duration;
        if (!duration) return;

        const interval = (duration * 1000) / highlights.length;
        let timer;

        if (isPlaying) {
            timer = setInterval(() => {
                setCurrentSlideIndex(prev => {
                    if (prev < highlights.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, interval);
        }

        return () => clearInterval(timer);
    }, [isPlaying, highlights.length]);

    return (
        <Card className="w-full overflow-hidden bg-black/90 text-white">
            <div className="relative aspect-video">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlideIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={imageUrls[currentSlideIndex]}
                            alt={`Scene ${currentSlideIndex + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="prose prose-invert prose-sm max-w-none"
                            >
                                <ReactMarkdown>
                                    {highlights[currentSlideIndex]}
                                </ReactMarkdown>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="p-4 flex items-center justify-between bg-black/60">
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePlayPause}
                        className="text-white hover:text-white/80"
                    >
                        {isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="text-white hover:text-white/80"
                    >
                        <SkipBack className="h-6 w-6" />
                    </Button>
                </div>

                {visualSummary.audio_url && (
                    <audio
                        ref={audioRef}
                        src={visualSummary.audio_url}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                    />
                )}
            </div>

            <div className="p-6 bg-black/40">
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{narrativeContent}</ReactMarkdown>
                </div>
            </div>
        </Card>
    );
} 