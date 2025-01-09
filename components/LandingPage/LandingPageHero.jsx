"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const TYPING_SPEED = 80;
const DELAY_BETWEEN_STORIES = 3000;

const storyData = [
    {
        text: "It was a dark and stormy night as the heroes entered the Quiet Hearth tavern. The barkeep, a burly man with a bushy beard, greeted them with a warm smile. 'Welcome to the Quiet Hearth,' he said, his voice carrying a hint of familiarity. 'What can I get you?'",
        image: "/hero_barkeep.jpg"
    },
    {
        text: "Deep in the ancient ruins of a forgotten civilization, our adventurers discovered mysterious runes glowing with an otherworldly light. Each symbol pulsed with energy, telling stories of battles long past.",
        image: "/hero_ruins.jpg"
    },
    {
        text: "The dragon's lair loomed before them, golden treasures scattered across the cavern floor. The air was thick with anticipation as they carefully stepped forward, knowing their next move could change everything.",
        image: "/hero_dragon.jpg"
    }
];

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

export default function LandingPageHero() {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const { displayedText, isTypingComplete, resetTyping } = useTypingEffect(storyData[currentStoryIndex].text);

    useEffect(() => {
        if (isTypingComplete) {
            const timeout = setTimeout(() => {
                resetTyping();
                setCurrentStoryIndex((prev) => (prev + 1) % storyData.length);
            }, DELAY_BETWEEN_STORIES);

            return () => clearTimeout(timeout);
        }
    }, [isTypingComplete, resetTyping]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
            <h1
                style={{ fontFamily: 'var(--font-departure-mono)' }} 
                className="text-4xl md:text-6xl text-center tracking-tight">
                AdventureHub.ai
            </h1>
            <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl mt-12 gap-8">
                <div className="flex-1 space-y-4">
                    <div 
                        style={{ fontFamily: 'var(--font-departure-mono)' }}
                        className="text-sm text-muted-foreground h-32 overflow-hidden">
                        {displayedText}
                        <span className="animate-pulse">|</span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStoryIndex}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ 
                                    opacity: 1,
                                    scale: 1.2,
                                    transition: {
                                        opacity: { duration: 0.5 },
                                        scale: { duration: 10, ease: "linear" }
                                    }
                                }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="relative w-full h-full"
                            >
                                <Image 
                                    src={storyData[currentStoryIndex].image}
                                    alt="Story Image"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}