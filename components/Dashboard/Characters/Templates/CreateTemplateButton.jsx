'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import { createCharacterTemplate } from '@/app/dashboard/actions';
import { Plus } from 'lucide-react';

export default function CreateTemplateButton({ campaignId }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        formData.append('campaignId', campaignId);

        // Add default schema and UI schema
        formData.append('schema', JSON.stringify({
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    title: 'Character Name'
                }
            }
        }));

        formData.append('ui_schema', JSON.stringify({
            'ui:order': ['name']
        }));

        try {
            const result = await createCharacterTemplate(formData);
            if (result.error) {
                throw new Error(result.error);
            }
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error creating template:', error);
            // TODO: Show error message to user
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Character Template</DialogTitle>
                        <DialogDescription>
                            Create a new character template for your campaign. You can customize the fields and layout after creating it.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., D&D 5e Character"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe what this template is for..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 