import { Button } from "@/components/ui/button"
import { Swords } from "lucide-react"


export default function LandingPageCTA() {
    return (
        <div className="flex justify-center items-center py-16 h-40">
            <Button size="lg" className="text-lg hover:scale-105">
                Sign Up <Swords className="ml-2" />
            </Button>
        </div>
    )
}