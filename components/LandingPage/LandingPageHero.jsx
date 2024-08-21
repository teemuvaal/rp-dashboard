export default function LandingPageHero() {
    return (
        <div>
            <div className="flex flex-col items-center text-zinc-900 px-4 sm:px-0">
                <div className="py-2 mt-4">
                    <p className="text-sm sm:text-base">Hello, Dungeon Master!👋</p>
                </div>
                <div className="py-2 flex items-center justify-center flex-col">
                    <h1 className="text-4xl sm:text-6xl font-bold font-serif text-center">
                        ADVENTURE HUB
                    </h1>
                    <p className="py-4 sm:py-8 text-sm sm:text-base">
                        Your next adventure starts here!
                    </p>
                </div>
                <div className="cover-image w-full h-[200px] sm:h-[400px] lg:h-[600px] overflow-hidden">
                    <img src="/LandingPageHero.png" alt="adventure map" className="object-cover w-full h-full" />
                </div>
            </div>
        </div>
    )
}