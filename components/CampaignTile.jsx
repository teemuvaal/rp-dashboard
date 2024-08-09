import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

export default function CampaignTile() {
    return (
        <>
            <Card className="border border-black rounded-md p-1 w-70">
                <CardHeader>
                    <CardTitle>The Isles Of Ascension</CardTitle>
                    <CardDescription>Active</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card>
        </>
    )
}