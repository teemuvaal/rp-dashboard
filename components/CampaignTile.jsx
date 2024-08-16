import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import { Button } from "@/components/ui/button"

export default function CampaignTile({name, description, role}) {
    return (
        <>
            <Card className="border border-black rounded-md p-1 w-70">
                <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>{role}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{description}</p>
                </CardContent>
                <CardFooter>
                    <Button>Open</Button>
                </CardFooter>
            </Card>
        </>
    )
}