import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
    return (
    <div className="flex flex-col items-center justify-center h-screen">
    <p>Uhh, the treasure is NOT HERE. Go back to the town.</p>
    <Link href="/"><Button>Home</Button></Link>
    </div>
    )
  }