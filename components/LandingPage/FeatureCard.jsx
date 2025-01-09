"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function FeatureCard({children, image, icon, title}) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-xl bg-background/50 p-1 shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-5xl mx-auto"
        >
            <div className="flex flex-col md:flex-row h-full w-full rounded-lg bg-background">
                <div className="flex w-full md:w-3/5 p-6 md:p-8"> 
                    <div className="flex flex-col space-y-6 w-full">
                        <h2 
                            style={{ fontFamily: 'var(--font-departure-mono)' }}
                            className="text-xl md:text-2xl font-semibold"
                        >
                            <span className="flex flex-row gap-2 items-center">
                                {icon}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-950 to-neutral-500">
                                    {title}
                                </span>
                            </span>
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            {children}
                        </p>                 
                    </div>
                </div>
                <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden rounded-b-lg md:rounded-r-lg md:rounded-b-none">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <Image 
                            src={image || "/productshot_dashboard.png"} 
                            alt={`${title} feature image`}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}   