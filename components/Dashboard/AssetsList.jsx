'use client';

import { useState } from 'react';
import { deleteAsset, updateAsset } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';
import { Trash2, Link, FileText, Image as ImageIcon, File, Globe, Lock, ChevronRight } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const typeIcons = {
    text: <FileText className="h-4 w-4" />,
    image: <ImageIcon className="h-4 w-4" />,
    link: <Link className="h-4 w-4" />,
    document: <File className="h-4 w-4" />
};

export default function AssetsList({ assets, campaignId, error: listError }) {
    const router = useRouter();
    const [error, setError] = useState(null);

    const handleTogglePublic = async (asset) => {
        setError(null);
        try {
            const formData = new FormData();
            formData.append('assetId', asset.id);
            formData.append('title', asset.title);
            formData.append('description', asset.description || '');
            formData.append('content', asset.content);
            formData.append('type', asset.type);
            formData.append('isPublic', (!asset.is_public).toString());

            const result = await updateAsset(formData);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || 'Failed to update asset');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    const handleDelete = async (assetId) => {
        setError(null);
        try {
            const result = await deleteAsset(assetId);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || 'Failed to delete asset');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    if (error || listError) {
        return (
            <div className="text-red-500 text-sm">
                {error || listError}
            </div>
        );
    }

    if (!assets?.length) {
        return (
            <div className="text-center text-muted-foreground py-8">
                No assets found. Create one to get started!
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {assets.map(asset => (
                <div
                    key={asset.id}
                    className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/${campaignId}/assets/${asset.id}/edit`)}
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                            {typeIcons[asset.type]}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-medium truncate">{asset.title}</h3>
                            {asset.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                    {asset.description}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                        <div 
                            className="flex items-center gap-2"
                            onClick={e => {
                                e.stopPropagation();
                                handleTogglePublic(asset);
                            }}
                        >
                            <Lock className={`h-4 w-4 ${asset.is_public ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
                            <Switch
                                checked={asset.is_public}
                                onCheckedChange={() => handleTogglePublic(asset)}
                            />
                            <Globe className={`h-4 w-4 ${asset.is_public ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:text-red-600 hover:bg-red-100"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this asset? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(asset.id);
                                        }}
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            ))}
        </div>
    );
} 