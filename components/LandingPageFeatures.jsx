import FeatureCard from "./FeatureCard";
import { NotebookPen, User, Map } from 'lucide-react';


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
        <div className="px-4 sm:px-0">
            <div className="flex flex-col items-center justify-center w-full my-6 sm:my-10 gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-serif">Features</h2>
            </div>
            <div className="flex flex-col items-center justify-center w-full my-6 sm:my-10 gap-4 sm:gap-2">
                {features.map((feature, index) => (
                    <FeatureCard key={index} title={feature.title} icon={feature.icon} children={feature.children} />
                ))}
            </div>
        </div>
    )
}