export default function DashboardHero({ name, description, image }) {
    const backgroundImage = image || 'https://qxvovctfjcxifcngajlq.supabase.co/storage/v1/object/public/campaign-images//LandingPageHero.png';

    return (
        <div 
            className="w-full h-40 sm:h-96 relative bg-cover bg-center mb-4 rounded-lg"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4 bg-black bg-opacity-50">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">{name}</h1>
                <p className="text-sm sm:text-lg text-white">{description}</p>
            </div>
        </div>
    )
}