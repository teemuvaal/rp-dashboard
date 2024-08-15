import { Button } from "@/components/ui/button"
import { Swords } from "lucide-react"
import Link from "next/link"


export default function LandingPageCTA() {
    return (
        <div className="flex justify-center items-center py-4 h-20">
           <Link href="/login">
           <Button size="lg" className="text-lg hover:scale-105" >
                Sign Up <Swords className="ml-2" />
            </Button>
            </Link>
        </div>
    )
}