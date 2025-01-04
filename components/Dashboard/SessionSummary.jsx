import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  

export default function SessionSummary({ session }) {
    return (
        <div>
           <Card>
                <CardHeader>
                    <CardTitle>Session Summary</CardTitle>
                    <CardDescription>Session Summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <div>This would be to create a summary</div>
                </CardContent>
            </Card>
        </div>
    )
}