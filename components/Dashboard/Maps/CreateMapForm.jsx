'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMap } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function CreateMapForm({ campaignId }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a preview URL for the selected image
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (formData) => {
        if (!selectedFile) {
            toast({
                title: 'Error',
                description: 'Please select a map image',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);
            formData.append('campaignId', campaignId);
            formData.append('file', selectedFile);

            const result = await createMap(formData);

            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: 'Success',
                description: 'Map created successfully',
            });

            // Navigate to the new map's detail page
            router.push(`/dashboard/${campaignId}/maps/${result.map.id}`);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create map',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Map Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Enter map title"
                    required
                />
            </div>

            {/* Map Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter map description"
                    rows={3}
                />
            </div>

            {/* Map Image Upload */}
            <div className="space-y-2">
                <Label htmlFor="file">Map Image</Label>
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file').click()}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Image
                    </Button>
                    <Input
                        id="file"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {selectedFile && (
                        <span className="text-sm text-muted-foreground">
                            {selectedFile.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Image Preview */}
            {previewUrl && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
                    <Image
                        src={previewUrl}
                        alt="Map preview"
                        fill
                        className="object-contain"
                    />
                </div>
            )}

            {/* Visibility Toggle */}
            <div className="flex items-center space-x-2">
                <Switch id="isPublic" name="isPublic" />
                <Label htmlFor="isPublic">Make this map visible to all campaign members</Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting || !selectedFile} className="w-full">
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Map...
                    </>
                ) : (
                    'Create Map'
                )}
            </Button>
        </form>
    );
} 