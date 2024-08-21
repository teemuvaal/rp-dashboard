import { Button } from "@/components/ui/button"
import { Swords } from "lucide-react"
import Link from "next/link"


export default function LandingPageCTA() {
    return (
        <div className="flex justify-center items-center py-4 h-auto sm:h-20">
           <Link href="/login">
           <Button size="lg" className="text-base sm:text-lg hover:scale-105 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                Sign Up <Swords className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            </Link>
        </div>
    )
}