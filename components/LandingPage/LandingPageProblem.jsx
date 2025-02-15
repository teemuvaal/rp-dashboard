

const problemData = [
    {
        title: "Plan & schedule your sessions",
        description: "Organize your sessions, keep track of events and quickly access all of your campaign knowledge.",
    },
    {
        title: "Share notes between participants",
        description: "All of your notes, assets and hightlights in one place available to all players on any device.",
    },
    {
        title: "AI-powered session recaps",
        description: "Relive your session highlights with smart AI-powered session recaps that feature your session highlights, images and a voice narration.",
    }
]

export default function LandingPageProblem() {
    return (
        <div 
        style={{ fontFamily: 'var(--font-departure-mono)' }}
        id="problem">
            <h1
            className="text-2xl md:text-4xl text-foreground mb-6"
            >Don't let your campaign fall apart - get everyone on the same story arc</h1>
        <div className="flex flex-row items-center justify-center h-auto sm:h-20 text-sm">
            {problemData.map((problem, index) => (
                <div key={index}
                className="p-4 w-1/3"
                style={{ fontFamily: 'var(--font-sans)' }}
                >
                    <h2
                    className="text-lg font-bold"
                    >{problem.title}</h2>
                    <p>{problem.description}</p>
                </div>
            ))}
        </div>
    </div>
    )
}