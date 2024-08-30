"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSession } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";

const CreateSessionForm = ({ campaignId, buttonStyle }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData) => {
    formData.append("campaignId", campaignId);
    const result = await createSession(formData);
    if (result.error) {
      console.error(result.error);
      // Handle error (e.g., show an error message to the user)
    } else {
      // Handle success
      console.log("Session created successfully", result);
      setOpen(false); // Close the dialog
      router.refresh(); // Refresh the page to show the new session
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonStyle}>
          Add Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
          <DialogDescription>
            Create a new session for the campaign. Choose a date and time for the session and add a title and description.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <Input name="name" type="text" placeholder="Session Title" required />
          <Textarea name="description" placeholder="Session Description" required />
          <Input name="duration" type="number" placeholder="Duration in minutes" required />
          <Input name="date" type="datetime-local" placeholder="Date and Time" required />
          <Button type="submit">Create Session</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionForm;