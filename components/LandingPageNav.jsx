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
        <>
        <div className={`sticky top-0 flex justify-between p-2 bg-${config.primaryColor} bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border-opacity-50 border-2 border-${config.primaryColor}`}>
            <span className="flex flex-row gap-2 align-middle">
                <Image src="/dice.png" alt="logo" width={50} height={50} />
                <h1 className={`text-2xl font-bold uppercase mt-2 text-${config.primaryColor}`}>AdventureHub.ai</h1>
            </span>
            <span className="mr-4 items-center">
            <Button className={`bg-${config.primaryColor}`}>
                <Link href="/login">Login</Link>
            </Button>
            </span>
        </div>
        </>
    )
}