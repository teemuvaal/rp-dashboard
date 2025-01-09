"use client"

import { useState, useEffect, useCallback } from "react"

const TYPING_SPEED = 50;
const DELAY_BETWEEN_STORIES = 3000;

const stories = [
    "It was a dark and stormy night as the heroes entered the Quiet Hearth tavern. The barkeep, a burly man with a bushy beard, greeted them with a warm smile. 'Welcome to the Quiet Hearth,' he said, his voice carrying a hint of familiarity. 'What can I get you?'",
    "Deep in the ancient ruins of a forgotten civilization, our adventurers discovered mysterious runes glowing with an otherworldly light. Each symbol pulsed with energy, telling stories of battles long past.",
    "The dragon's lair loomed before them, golden treasures scattered across the cavern floor. The air was thick with anticipation as they carefully stepped forward, knowing their next move could change everything."
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
    const { displayedText, isTypingComplete, resetTyping } = useTypingEffect(stories[currentStoryIndex]);

    useEffect(() => {
        if (isTypingComplete) {
            const timeout = setTimeout(() => {
                resetTyping();
                setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
            }, DELAY_BETWEEN_STORIES);

            return () => clearTimeout(timeout);
        }
    }, [isTypingComplete, resetTyping]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
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
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p 
                            style={{ fontFamily: 'var(--font-departure-mono)' }}
                            className="text-muted-foreground">
                            Image placeholder
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}