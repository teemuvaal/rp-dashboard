import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CampaignTile({name, description, role, id}) {
    return (
        <div className="w-1/3">
            <Card className="border border-black rounded-md p-1 w-70">
                <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>{role}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{description}</p>
                </CardContent>
                <CardFooter>
                    <Link href={`/dashboard/${id}`}><Button>Open</Button></Link>
                </CardFooter>
            </Card>
        </div>
    )
}