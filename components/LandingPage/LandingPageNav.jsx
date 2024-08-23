import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";


  
const links = [
    {
        label: "Home",
        href: "#top",
    },
    {
        label: "FAQ",
        href: "#faq",
    },
]


export default function LandingPageNav() {
    return (
        <div className={`sticky top-0 flex flex-col sm:flex-row justify-between p-2 bg-red-950 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border-opacity-50 border-2 border-red-950`}>
            <span className="flex flex-row gap-2 align-middle justify-center sm:justify-start mb-2 sm:mb-0">
                <Image src="/dice.png" alt="logo" width={40} height={40} />
                <h1 className={`text-xl sm:text-2xl font-bold uppercase mt-1 sm:mt-2 font-serif text-[#3c2a1e]`}>AdventureHub.ai</h1>
            </span>
            <span className="flex justify-center sm:justify-end sm:mr-4 items-center">
            <Button className={`bg-red-950 hover:bg-red-900 text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2`}>
                <Link href="/login">Login</Link>
            </Button>
            </span>
        </div>
    )
}