"use client"

import { motion } from "framer-motion";


export default function LandingPageHero() {
    return (
        <div>
            <div className="flex flex-col items-center text-[#3c2a1e] px-4 sm:px-0">
                <div className="py-2 mt-4">
                    <p className="text-sm sm:text-base">Hello, Dungeon Master!👋</p>
                </div>
                <div className="py-2 flex items-center justify-center flex-col">
                <motion.h1 
                className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl/none font-serif"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                ADVENTURE HUB
              </motion.h1>
              <motion.p 
                className="mx-auto max-w-[700px] text-xl text-[#5a4738] md:text-2xl font-serif"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                    Your next adventure starts here!
                </motion.p> 
                </div>
                <div className="cover-image w-full h-[200px] sm:h-[400px] lg:h-[600px] overflow-hidden">
                    <img src="/LandingPageHero.png" alt="adventure map" className="object-cover w-full h-full" />
                </div>
            </div>
        </div>
    )
}