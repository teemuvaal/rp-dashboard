export default function FeatureCard() {
    return (
            <div className="flex flex-row h-64 w-1/2 border border-gray-200 rounded-lg shadow-md bg-white">
                <div className="flex justify-center w-1/2 p-4"> 
                    <span className="flex flex-col">
                    <h2 className="text-2xl font-bold">
                        Campaign Notes
                    </h2>
                    <p className="text-sm text-gray-500">
                        All your campaign notes in one place. Create, share and live through your campaign with your players.
                    </p>                 
                    </span>
                </div>
                <div className="flex items-center justify-center w-1/2">
                    Feature Image
                </div>
        </div>
    )
}   