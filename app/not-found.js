import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">
        Sorry Adventurer, looks like you are lost.
      </h1>
      <Image src="/404.jpg" alt="404" width={300} height={300} />
        <p className="text-lg">I can only show you a road that takes you back to the safety of your home.</p>
        <Link href="/">
            <Button>Return Home</Button>
        </Link>
      </div>
  )
} 