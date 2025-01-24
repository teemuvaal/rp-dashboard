'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createAsset } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';
import { ForwardRefEditor } from '@/utils/mdxeditor/ForwardRefEditor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileText, Link, Image as ImageIcon } from "lucide-react";

export default function AddAsset({ campaignId }) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('text');
    const [isPublic, setIsPublic] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('campaignId', campaignId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('content', content);
            formData.append('type', type);
            formData.append('isPublic', isPublic.toString());

            const result = await createAsset(formData);
            if (result.success) {
                // Reset form
                setTitle('');
                setDescription('');
                setContent('');
                setType('text');
                setIsPublic(false);
                router.refresh();
            } else {
                setError(result.error || 'Failed to create asset');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter asset title"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter asset description"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Text
                                </div>
                            </SelectItem>
                            <SelectItem value="link">
                                <div className="flex items-center">
                                    <Link className="h-4 w-4 mr-2" />
                                    Link
                                </div>
                            </SelectItem>
                            <SelectItem value="image">
                                <div className="flex items-center">
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Image
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    {type === 'text' ? (
                        <div className="min-h-[400px] border rounded-md">
                            <ForwardRefEditor
                                markdown={content}
                                onChange={setContent}
                            />
                        </div>
                    ) : (
                        <Input
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={type === 'image' ? 'Enter image URL' : 'Enter content URL'}
                            required
                        />
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="public"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                    />
                    <Label htmlFor="public">Make public</Label>
                </div>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Asset'}
                    </Button>
                </div>
            </form>
        </div>
    );
} 