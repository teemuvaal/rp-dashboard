'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteAsset, updateAsset } from "@/app/dashboard/actions";
import { useRouter } from 'next/navigation';
import { Trash2, Link, FileText, Image as ImageIcon, File, Globe, Lock } from "lucide-react";
import Image from "next/image";
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
import EditAssetDialog from './EditAssetDialog';

const typeIcons = {
    text: <FileText className="h-4 w-4" />,
    image: <ImageIcon className="h-4 w-4" />,
    link: <Link className="h-4 w-4" />,
    document: <File className="h-4 w-4" />
};

export default function AssetsList({ assets, campaignId, error: listError }) {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (assetId) => {
        setIsDeleting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('assetId', assetId);

            const result = await deleteAsset(formData);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || 'Failed to delete asset');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleTogglePublic = async (asset) => {
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

    if (listError) {
        return (
            <div className="text-sm text-red-500">
                Error loading assets: {listError}
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No assets found. Create your first asset to get started.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
            
            {assets.map((asset) => (
                <Card key={asset.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {typeIcons[asset.type]}
                                    {asset.title}
                                </CardTitle>
                                {asset.description && (
                                    <CardDescription>{asset.description}</CardDescription>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Lock className={`h-4 w-4 ${asset.is_public ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
                                    <Switch
                                        checked={asset.is_public}
                                        onCheckedChange={() => handleTogglePublic(asset)}
                                    />
                                    <Globe className={`h-4 w-4 ${asset.is_public ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                                </div>
                                <EditAssetDialog asset={asset} />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
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
                                                onClick={() => handleDelete(asset.id)}
                                                className="bg-red-500 hover:bg-red-600"
                                            >
                                                {isDeleting ? 'Deleting...' : 'Delete Asset'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {asset.type === 'image' ? (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                <Image
                                    src={asset.content}
                                    alt={asset.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : asset.type === 'link' ? (
                            <a 
                                href={asset.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                {asset.content}
                            </a>
                        ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {asset.content}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                        Created by {asset.users.username} • {asset.is_public ? 'Public' : 'Private'}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
} 