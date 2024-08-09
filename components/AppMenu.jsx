export default function AppMenu() {
    return (
        <div className="bg-gray-900 text-white py-2 px-8">
            <div className="flex justify-between items-center">
            <h1
            className="hover:bg-gray-700 px-10 rounded-md"
            >Feed</h1>
            <h1 className="hover:bg-gray-700 px-10 rounded-md">Session</h1>
            <h1 className="hover:bg-gray-700 px-10 rounded-md">Notes</h1>
            <h1 className="hover:bg-gray-700 px-10 rounded-md">Characters</h1>
            </div>
        </div>
    )
}