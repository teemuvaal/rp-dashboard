import FeatureCard from "./FeatureCard";

export default function LandingPageFeatures() {
    return (
        <div>
            <div className="flex flex-col items-center justify-center w-full my-10 gap-2">
                <h2 className="text-2xl font-bold">Features</h2>
            </div>
            <div className="flex flex-col items-center justify-center w-full my-10 gap-2">
                <FeatureCard />
                <FeatureCard />
                <FeatureCard />
            </div>
        </div>
    )
}