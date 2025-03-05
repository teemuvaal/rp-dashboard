"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign } from '@/app/dashboard/actions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
export default function CreateCampaignForm() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData) => {
        const result = await createCampaign(formData);
        if (result.error) {
            console.error(result.error);
            // Handle error (e.g., show an error message to the user)
        } else {
            // Handle success
            console.log("Campaign created successfully", result);
            setOpen(false); // Close the dialog
            router.refresh(); // Refresh the page to show the new campaign
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="ghost">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Campaign
                                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new campaign</DialogTitle>
                    <DialogDescription>
                        Give your campaign a name and a short description to identify it.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="flex flex-col gap-4">
                    <Input name="name" type="text" placeholder="Campaign Name" required />
                    <Textarea name="description" placeholder="Campaign Description" required />
                    <Button type="submit">Create Campaign</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}