'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

export default function CreatePostDialog({ campaignId, createPost }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCreatePost = async (formData) => {
        await createPost(formData);
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="rounded-full"
                >
                    Add Post
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Post</DialogTitle>
                    <DialogDescription>
                        Add a public post that will be displayed in the front page of your campaign.
                    </DialogDescription>
                    <form
                        action={handleCreatePost}
                        className="flex flex-col gap-4"
                    >
                        <input type="hidden" name="campaignId" value={campaignId} />
                        <label htmlFor="title">Title</label>
                        <Input id="title" name="title" required />
                        <label htmlFor="content">Content</label>
                        <Textarea id="content" name="content" required />
                        <Button type="submit">Add post</Button>
                    </form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
} 