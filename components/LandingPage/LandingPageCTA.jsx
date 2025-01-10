import { Button } from "@/components/ui/button"
import { Swords } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function LandingPageCTA() {
    return (
        <div 
        style={{ fontFamily: 'var(--font-departure-mono)' }}
        className="flex flex-col justify-center items-center py-4 sm:h-20 gap-4">
            <p
            className="text-sm text-muted-foreground"
            >
                AdventureHub.ai is currently in development. Sign up to get early access to the beta.
            </p>
           <Link href="/login">
           <Button size="lg" className="bg-white text-black">
                Sign Up <Swords className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            </Link>
        </div>
    )
}