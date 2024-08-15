export default function Hero() {
    return (
        <div 
            className="w-full h-64 relative bg-cover bg-center"
            style={{ backgroundImage: "url('/isles_of_ascendancy.jpeg')" }}
        >
            <div className="absolute bottom-0 left-0 w-full p-4 bg-black bg-opacity-50">
                <h1 className="text-2xl font-bold mb-2 text-white">Current Campaign Name</h1>
                <p className="text-lg text-white">Current Campaign Description</p>
            </div>
        </div>
    )
}