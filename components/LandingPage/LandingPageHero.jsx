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
        <div className="w-full">
            <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-6 sm:pb-8">
                <div className="flex flex-col items-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontFamily: 'var(--font-departure-mono)' }} 
                        className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-foreground mb-3 sm:mb-4"
                    >
                        AdventureHub.ai
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 px-4"
                        style={{ fontFamily: 'var(--font-departure-mono)' }}
                    >
                        Your digital companion for tabletop adventures
                    </motion.p>
                </div>
            </div>

            <div className="relative min-h-[60vh] sm:min-h-[70vh] w-full overflow-hidden">
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

                <div className="relative z-10 flex flex-col md:flex-row items-start justify-between h-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
                    {/* Left side: Notes to Animation Showcase */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-8"
                    >
                        {/* We'll replace this with your screenshot */}
                        <div className="bg-background/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                            <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                style={{ fontFamily: 'var(--font-departure-mono)' }}
                                className="text-base sm:text-lg md:text-xl text-white/90 mb-4 tracking-tight"
                            >
                                From your session notes
                                <span className="text-primary">...</span>
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="relative"
                            >
                                {/* Screenshot will go here */}
                                <div className="aspect-[4/3] bg-background/20 rounded-md overflow-hidden">
                                    <Image
                                        src="https://qxvovctfjcxifcngajlq.supabase.co/storage/v1/object/public/general-assets//notes.png"
                                        alt="Session Notes Example"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right side: Story Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full md:w-1/2"
                    >
                        <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{ fontFamily: 'var(--font-departure-mono)' }}
                            className="text-base sm:text-lg md:text-xl text-white/90 mb-4 tracking-tight"
                        >
                            to immersive stories
                            <span className="text-primary animate-pulse">_</span>
                        </motion.p>
                        <div 
                            style={{ fontFamily: 'var(--font-departure-mono)' }}
                            className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed bg-background/10 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                        >
                            {displayedText}
                            <span className="animate-pulse ml-1">|</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}