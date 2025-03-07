import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function CampaignTile({name, description, role, id, campaign_image}) {
    return (
        <Card className="group relative overflow-hidden w-full transition-transform hover:scale-[1.02] duration-300">
          <div className="absolute inset-0 z-0">
            <Image
              src={campaign_image || 'https://qxvovctfjcxifcngajlq.supabase.co/storage/v1/object/public/campaign-images//LandingPageHero.png'}
              alt={name}
              fill
              style={{objectFit: 'cover'}}
              quality={100}
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <div 
              className="absolute inset-0" 
              style={{
                background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7))'
              }}
            />
          </div>
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">{name}</CardTitle>
              <CardDescription className="text-white/90">{role}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/95 leading-relaxed">{description}</p>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/${id}`}>
                <Button 
                  variant="secondary" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Open
                </Button>
              </Link>
            </CardFooter>
          </div>
        </Card>
      )
}