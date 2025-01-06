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
                    <CardDescription>Combine your session notes to compile a summary of the events for this session.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div>This would be to create a summary</div>
                </CardContent>
            </Card>
        </div>
    )
}