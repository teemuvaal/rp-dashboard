import Image from "next/image";

export default function LandingPageHero() {
    return (
        <div>
            <div className="flex flex-col items-center text-zinc-900">
                <div className="py-2 mt-4">
                    <p>Hello, Dungeon Master!👋</p>
                </div>
                <div className="py-2 flex items-center justify-center flex-col">
                    <h1 className="text-6xl font-bold font-serif">
                        ADVENTURE HUB
                    </h1>
                    <p className="py-8">
                        Your next adventure starts here!
                    </p>
                </div>
                <div className="cover-image w-full lg:h-[600px] h-[200px] overflow-hidden">
                    <img src="/LandingPageHero.png" alt="adventure map" />
                </div>
            </div>
        </div>
    )
}