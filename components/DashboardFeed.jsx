import FeedTile from "./FeedTile";
import CalendarTile from "./CalendarTile";

export default function Feed({ feedItems, calendarEvents }) {
    return (
        <div className="w-full flex flex-col lg:flex-row p-2 sm:p-4 mb-auto gap-2 h-full">
            <div className="w-full lg:w-2/3 border border-gray-200 rounded-md p-2 sm:p-4 shadow-md">
                <h1 className="text-xl sm:text-2xl font-bold">Feed</h1>
                <p className="text-xs sm:text-sm font-light text-gray-500 mb-4">Latest events, posts, etc. from the campaign</p>
                <section className="space-y-4">
                    {feedItems.map((item, index) => (
                        <FeedTile 
                            key={index} 
                            title={item.title} 
                            content={item.content}
                            author={item.author}
                            createdAt={item.createdAt}
                        />
                    ))}
                </section>
            </div>
            <div className="w-full lg:w-1/3 border border-gray-200 rounded-md p-2 sm:p-4 shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Calendar</h2>
                <CalendarTile events={calendarEvents} />
            </div>
        </div>  
    )
}