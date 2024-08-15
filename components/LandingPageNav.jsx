import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function LandingPageNav() {
    return (
        <>
        <div className="sticky top-0 flex justify-between p-2 bg-gray-300 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border border-gray-100">
            <span className="flex flex-row gap-2 align-middle">
                <Image src="/dice.png" alt="logo" width={50} height={50} />
                <h1 className="text-2xl font-bold uppercase mt-2">AdventureHub.ai</h1>
            </span>
            <span className="mr-4">
            <Button>
                <Link href="/login">Login</Link>
            </Button>
            </span>
        </div>
        </>
    )
}