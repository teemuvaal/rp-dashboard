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

export default function AiChatOpen({ params }) {
    return (
<Sheet>
<SheetTrigger asChild>
    <Button
    variant="outline"
    >
        AI Assistant
    </Button>
</SheetTrigger>
<SheetContent className="w-[800px]">
    <SheetHeader>
        <SheetTitle>AI Assistant</SheetTitle>
        <SheetDescription>
            Chat with your AI Assistant to brain storm, design and implement ideas.
        </SheetDescription>
            </SheetHeader>
                <AssistantChat campaignId={params.id} />
            </SheetContent>
        </Sheet>
    )
}