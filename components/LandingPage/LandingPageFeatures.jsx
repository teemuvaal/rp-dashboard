"use client"

import FeatureCard from "./FeatureCard";
import { NotebookPen, User, Map } from 'lucide-react';
import { motion } from "framer-motion";
// List all features here

const features = [
    {
        title: "Campaign Notes",
        icon: <NotebookPen height={20} width={20}/>,
        children: "All your campaign notes in one place. Create, share and live through your campaign with your players. Add, edit and collaborate on real time with your players.",
        image: "/productshot_dashboard.png"
    },
    {
        title: "Character Sheets",
        icon: <User height={20} width={20}/>,
        children: "Create and share your character sheets with your players. Craft and enhance your characters background using AI."
    },
    {
        title: "Interactive Assets",
        icon: <Map height={20} width={20}/>,
        children: "Share your maps and assets with your players. Use AI to generate your maps and assets."
    }
]


export default function LandingPageFeatures() {
    return (
        <div>
            <h2>Features</h2>
        </div>
    )
}