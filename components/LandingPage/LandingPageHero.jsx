export default function LandingPageHero() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
            <h1 className="text-4xl md:text-6xl font-departure-mono text-center tracking-tight">
                AdventureHub.ai
            </h1>
            <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl mt-12 gap-8">
                <div className="flex-1 space-y-4">
                    <p className="text-xl md:text-2xl font-departure-mono text-muted-foreground">
                        Your digital companion for tabletop adventures
                    </p>
                    <p className="text-lg text-muted-foreground">
                        Streamline your campaign management with AI-powered tools
                    </p>
                </div>
                <div className="flex-1">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Image placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    )
}