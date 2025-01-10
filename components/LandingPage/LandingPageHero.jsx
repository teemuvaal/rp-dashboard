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
        <div className="relative min-h-[75vh] lg:min-h-[70vh] w-full overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStoryIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Image 
                        src={storyData[currentStoryIndex].image}
                        alt="Story Image"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div 
                        className="absolute inset-0" 
                        style={{
                            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7))'
                        }}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-6xl mx-auto px-6 py-16 md:py-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontFamily: 'var(--font-departure-mono)' }} 
                    className="text-4xl md:text-6xl text-white mb-6"
                >
                    AdventureHub.ai
                </motion.h1>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-2xl"
                >
                    <p className="text-lg md:text-xl text-white/90 mb-6" style={{ fontFamily: 'var(--font-departure-mono)' }}>
                        Your digital companion for tabletop adventures
                    </p>
                    <div 
                        style={{ fontFamily: 'var(--font-departure-mono)' }}
                        className="text-base md:text-lg text-white/80 leading-relaxed"
                    >
                        {displayedText}
                        <span className="animate-pulse ml-1">|</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}