const date = new Date();

export default function FeedTile({title, children}) {
    return (
        <div className="border border-gray-300 rounded-sm p-2 mb-2">
            <span className="flex flex-row gap-2">
                <div className="rounded-full bg-black w-6 h-6">
                </div>
                <div className="w-full">
                    <span className="flex flex-row place-content-between">                 
                    <h3 className="font-bold">{title}</h3>
                    <h4 className="text-xs font-light text-gray-500"> {date.toLocaleDateString()} </h4>
                    </span>
                    <p className="text-sm font-light">{children}</p>
                </div>
            </span>
        </div>
    )
}