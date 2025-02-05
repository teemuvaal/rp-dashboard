'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TYPING_SPEED = 30; // Adjust typing speed as needed

function useTypingEffect(text, speed = TYPING_SPEED) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            setIsTypingComplete(true);
        }
    }, [currentIndex, text, speed]);

    const resetTyping = useCallback(() => {
        setDisplayedText("");
        setCurrentIndex(0);
        setIsTypingComplete(false);
    }, []);

    return { displayedText, isTypingComplete, resetTyping };
}

export default function StoryViewer({ visualSummary }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const audioRef = useRef(null);
    const { displayedText, resetTyping } = useTypingEffect(visualSummary.narrative_content || '');
    const imageUrls = visualSummary.image_urls || [];

    useEffect(() => {
        if (!audioRef.current) return;

        const handleAudioLoad = () => {
            const duration = audioRef.current.duration;
            if (!duration) return;

            // Set up image transitions at 1/3 intervals of the audio duration
            const interval = duration / 3;
            let currentInterval = 0;

            const checkTime = () => {
                if (!audioRef.current) return;
                const currentTime = audioRef.current.currentTime;
                const newInterval = Math.floor(currentTime / interval);
                
                if (newInterval !== currentInterval && newInterval < 3) {
                    currentInterval = newInterval;
                    setCurrentSlideIndex(newInterval);
                }
            };

            audioRef.current.addEventListener('timeupdate', checkTime);
            return () => audioRef.current?.removeEventListener('timeupdate', checkTime);
        };

        audioRef.current.addEventListener('loadedmetadata', handleAudioLoad);
        return () => audioRef.current?.removeEventListener('loadedmetadata', handleAudioLoad);
    }, []);

    const handlePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentSlideIndex(0);
        resetTyping();
    };

    return (
        <Card className="w-full overflow-hidden bg-black/90 text-white">
            <div className="flex flex-col md:flex-row h-[80vh]">
                {/* Left side - Narration text */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                    <div className="prose prose-invert prose-lg max-w-none">
                        {displayedText}
                        <span className="animate-pulse ml-1">|</span>
                    </div>
                </div>

                {/* Right side - Images */}
                <div className="w-full md:w-1/2 relative">
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
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
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

                <audio
                    ref={audioRef}
                    src={visualSummary.audio_url}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
            </div>
        </Card>
    );
} 