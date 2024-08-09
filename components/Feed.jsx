import FeedTile from "./FeedTile";
import CalendarTile from "./CalendarTile";

export default function Feed() {
    return (
        <div className="w-full flex flex-row p-4 mb-auto gap-2 h-full">
            <div className="basis-2/3 border border-gray-200 rounded-md p-4 shadow-md">
            <h1
            className="text-2xl font-bold"
            >Feed</h1>
            <p
            className="text-sm font-light text-gray-500"
            >Latest events, posts, etc. from the campaign</p>
            <section className="flex flex-col gap-2 my-2">
                <FeedTile title="Thanks for the session!">Looking forward to the next session!</FeedTile>
                <FeedTile title="New Post">What a great games we had last session!</FeedTile>
                <FeedTile title="New Post">What a great games we had last session!</FeedTile>
                <FeedTile title="New Post">Alright, somebody accidentally took my dices? Please return!!!</FeedTile>
                <FeedTile title="New Post">REMEMBER! SAUNA IS BEFORE THE GAME!</FeedTile>
                <FeedTile title="New Post">REMEMBER! SAUNA IS NOT A BATHROOM!</FeedTile>
                <FeedTile title="New Post">Hello all, testing if this works 😃</FeedTile>
            </section>
            </div>
            <div className="basis-1/3 border border-gray-200 rounded-md p-4 h-full shadow-md">
                <p
                className="text-2xl font-bold"
                >Calendar</p>
                <CalendarTile />
            </div>
        </div>  
    )
}