import Image from "next/image";

export default function Footer() {
    return (
            <footer className="w-full bg-gray-900 text-white flex flex-row p-4 h-40">
                <div className="basis-1/3 flex flex-row gap-2">
                    <Image src="/dice.png" alt="Logo" width={100} height={100} />
                    <p className="text-sm font-light">
                        RP Campaign is the tool to manage your roleplay campaign.
                    </p>
                </div>
                <div className="basis-1/3">
                    <p>Links</p>
                    <p>About</p>
                    <p>Contact</p>
                </div>
                <div className="basis-1/3">
                    <p>Socials</p>
                    <p>Instagram</p>
                    <p>Facebook</p>
                    <p>X</p>  
                </div>
            </footer>
    )
}