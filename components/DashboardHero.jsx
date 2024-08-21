export default function Hero({ name, description, image }) {
    return (
        <div 
            className="w-full h-40 sm:h-64 relative bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
        >
            <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4 bg-black bg-opacity-50">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">{name}</h1>
                <p className="text-sm sm:text-lg text-white">{description}</p>
            </div>
        </div>
    )
}