"use client"

import FeatureCard from "./FeatureCard";
import { NotebookPen, User, Map } from 'lucide-react';
import { motion } from "framer-motion";
// List all features here

const features = [
    {
        title: "Campaign Notes",
        icon: <NotebookPen height={20} width={20}/>,
        children: "Share your notes, keep them organized and clean up with AI.",
        image: "/productshot_dashboard.png"
    },
    {
        title: "Polls",
        icon: <User height={20} width={20}/>,
        children: "Manage your sessions, schedules and more with polls."
    },
    {
        title: "Assets",
        icon: <Map height={20} width={20}/>,
        children: "Share and manage your campaign assets with your players."
    }
]


export default function LandingPageFeatures() {
    return (
        <div className="flex flex-col items-center justify-center" id="features">
            <h2
            style={{ fontFamily: 'var(--font-departure-mono)' }}
            className="text-2xl md:text-4xl text-white mb-6"
            >Features</h2>
            <div className="flex flex-col items-center justify-center">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
    )
}