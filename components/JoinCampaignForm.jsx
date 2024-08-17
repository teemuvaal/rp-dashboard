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
        <div>
            <Dialog>
                <DialogTrigger>
                    <Button>Join Campaign</Button>
                </DialogTrigger>
                <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Join Campaign</DialogTitle>
                            <DialogDescription>
                                Use the invitation code received from the campaign owner to join the campaign.
                            </DialogDescription>
                            <Input name="invitationCode" type="text" placeholder="Invitation Code" required />
                            <Button type="submit">Join Campaign</Button>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
        </div>
    )
}