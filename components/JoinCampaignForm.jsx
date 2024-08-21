import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  

export default function JoinCampaignForm() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-red-950 hover:bg-red-700 text-white font-bold">
                    Join Campaign
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join Campaign</DialogTitle>
                    <DialogDescription>
                        Use the invitation code received from the campaign owner to join the campaign.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                    <Input name="invitationCode" type="text" placeholder="Invitation Code" required />
                    <Button type="submit">Join Campaign</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}