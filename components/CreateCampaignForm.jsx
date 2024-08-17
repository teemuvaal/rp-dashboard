import { createCampaign } from '@/app/dashboard/actions'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input"
  import { Textarea } from "@/components/ui/textarea"
  import { Button } from "@/components/ui/button"


export default function CreateCampaignForm() {
  return (
    <div>
    <Dialog>
        <DialogTrigger>
            <Button>Create Campaign</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create a new campaign</DialogTitle>
            <DialogDescription>
                Give your campaign a name and a short description to identify it.
            </DialogDescription>
            </DialogHeader>
            <div>
            <form action={createCampaign}
            className="flex flex-col gap-4"
            >
                <Input name="name" type="text" placeholder="Campaign Name" required />
                <Textarea name="description" placeholder="Campaign Description" required />
                <Button type="submit">Create Campaign</Button>
            </form>
            </div>
        </DialogContent>
    </Dialog>
    </div>
  )
}