

export default function FeatureCard({children, image, icon, title}) {
    return (
            <div className="flex flex-row h-64 w-full rounded-lg">
                <div className="flex w-1/2 p-4"> 
                    <span className="flex flex-col">
                    <h2 className="text-2xl font-bold">
                        <span className="flex flex-row gap-2 items-center text-red-950">{icon}{title}</span>
                    </h2>
                    <p className="text-sm text-[#5a4738] text-left">
                        {children}
                    </p>                 
                    </span>
                </div>
                <div className="flex items-center justify-center w-1/2">
                    <img src="/productshot_dashboard.png" alt="Feature Image" className="w-full h-full object-cover" />
                </div>
        </div>
    )
}   