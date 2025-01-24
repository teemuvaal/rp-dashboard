'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateAsset } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';
import { ForwardRefEditor } from '@/utils/mdxeditor/ForwardRefEditor';
import { ArrowLeft } from 'lucide-react';

export default function EditAssetPage({ asset, campaignId }) {
    const router = useRouter();
    const [title, setTitle] = useState(asset.title);
    const [description, setDescription] = useState(asset.description || '');
    const [content, setContent] = useState(asset.content);
    const [isPublic, setIsPublic] = useState(asset.is_public);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('assetId', asset.id);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('content', content);
            formData.append('type', asset.type);
            formData.append('isPublic', isPublic.toString());

            const result = await updateAsset(formData);
            if (result.success) {
                router.push(`/dashboard/${campaignId}/assets`);
                router.refresh();
            } else {
                setError(result.error || 'Failed to update asset');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/dashboard/${campaignId}/assets`)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Assets
                </Button>
                <h1 className="text-2xl font-bold">Edit Asset</h1>
            </div>

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
                    <Label htmlFor="content">Content</Label>
                    {asset.type === 'text' ? (
                        <div className="min-h-[600px] border rounded-md">
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
                            placeholder={asset.type === 'image' ? 'Enter image URL' : 'Enter content URL'}
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

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/${campaignId}/assets`)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
} 