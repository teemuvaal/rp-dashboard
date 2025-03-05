import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import AssistantChat from "@/components/Dashboard/AssistantChat"
import { Bot } from "lucide-react"
import ShinyText from "@/components/ui/shiny-text"

export default function AiChatOpen({ params }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start"
                >
                    <Bot className="h-4 w-4 mr-2" />
                    <ShinyText text="AI Assistant" speed={10} className="" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[600px] sm:w-[800px]" side="right">
                <SheetHeader className="mb-4">
                    <SheetTitle>AI Assistant</SheetTitle>
                    <SheetDescription>
                        Chat with your AI Assistant to brainstorm, design and implement ideas.
                    </SheetDescription>
                </SheetHeader>
                <AssistantChat campaignId={params.id} />
            </SheetContent>
        </Sheet>
    )
}