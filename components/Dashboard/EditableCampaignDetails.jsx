'use client'

import { useState } from 'react'
import { updateCampaignDetails, uploadCampaignImage } from '@/app/dashboard/actions'
import { generateCampaignImage } from '@/app/dashboard/aiactions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pen, Pencil, Save, Sparkles, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function EditableCampaignDetails({ campaign, campaignId }) {
    const [editedCampaign, setEditedCampaign] = useState(campaign)
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [newTag, setNewTag] = useState('')
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const router = useRouter()

    const handleSave = async (field) => {
        const updates = { [field]: editedCampaign[field] }
        const result = await updateCampaignDetails(campaignId, updates)
        if (result.error) {
            alert(result.error)
        } else {
            setEditedCampaign(result.campaign)
            router.refresh()
        }
        if (field === 'name') setIsEditingName(false)
        if (field === 'description') setIsEditingDescription(false)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setIsUploading(true)
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('campaignId', campaignId)

        const result = await uploadCampaignImage(formData)
        setIsUploading(false)

        if (result.error) {
            alert(result.error)
        } else {
            setEditedCampaign({ ...editedCampaign, campaign_image: result.imageUrl })
            router.refresh()
        }
    }

    const handleAddTag = async () => {
        if (newTag && !editedCampaign.tags.includes(newTag)) {
            const updatedTags = [...editedCampaign.tags, newTag]
            const result = await updateCampaignDetails(campaignId, { tags: updatedTags })
            if (result.error) {
                alert(result.error)
            } else {
                setEditedCampaign(result.campaign)
                setNewTag('')
                router.refresh()
            }
        }
    }

    const handleRemoveTag = async (tagToRemove) => {
        const updatedTags = editedCampaign.tags.filter(tag => tag !== tagToRemove)
        const result = await updateCampaignDetails(campaignId, { tags: updatedTags })
        if (result.error) {
            alert(result.error)
        } else {
            setEditedCampaign(result.campaign)
            router.refresh()
        }
    }

    const handleGenerateImage = async () => {
        if (!editedCampaign.description) {
            alert('Please add a campaign description first');
            return;
        }

        setIsGeneratingImage(true);
        try {
            const result = await generateCampaignImage({
                campaignId,
                description: editedCampaign.description
            });

            if (result.success) {
                setEditedCampaign({ ...editedCampaign, campaign_image: result.imageUrl });
                router.refresh();
            } else {
                alert(result.error || 'Failed to generate image');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            alert('An unexpected error occurred');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {isEditingName ? (
                <span className="flex flex-row gap-2 items-center">
                    <h1 className="font-bold">Campaign name:</h1>
                    <Input 
                        className="w-[400px]" 
                        value={editedCampaign.name} 
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, name: e.target.value })} 
                    />
                    <Save 
                        className="w-4 h-4 cursor-pointer hover:scale-110" 
                        onClick={() => handleSave('name')} 
                    />
                </span>
            ) : (
                <div className="flex flex-col gap-2">
                    <span>
                        <h1 className="font-bold">Campaign name:</h1>
                        <p className="text-gray-500 text-sm">What is your epic adventure called?</p>
                    </span>
                <span className="flex flex-row gap-2 items-center text-sm">
                    <h2>{editedCampaign.name}</h2>
                    <Pen 
                        className="w-4 h-4 cursor-pointer hover:scale-110" 
                        onClick={() => setIsEditingName(true)} 
                    /> 
                </span>
                </div>
            )}
        
            {isEditingDescription ? (
                <span className="flex flex-col gap-2">
                    <Textarea 
                        className="w-[400px]" 
                        value={editedCampaign.description} 
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, description: e.target.value })} 
                    />
                    <Save 
                        className="w-4 h-4 cursor-pointer hover:scale-110" 
                        onClick={() => handleSave('description')} 
                    />
                </span>
            ) : (
                <div className="flex flex-col gap-2">
                    <span>
                        <h1 className="font-bold">Campaign description:</h1>
                        <p className="text-gray-500 text-sm">Tell us about your epic adventure. What is your tagline?</p>
                    </span>
                    <span className="flex flex-row gap-2 items-center text-sm">
                        <p>{editedCampaign.description}</p>
                    <Pencil 
                        className="w-4 h-4 cursor-pointer hover:scale-110" 
                        onClick={() => setIsEditingDescription(true)} 
                    />
                </span>
                </div>
            )}
            <div>
                <h1 className="font-bold">Tags:</h1>
                <p className="text-gray-500 text-sm">Add up to 5 tags to your campaign. These will help with AI features by providing context.</p>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {editedCampaign.tags.map((tag, index) => (
                            <Badge key={index}>
                            <span key={index} className="flex items-center">
                                {tag}
                                <X
                                    className="ml-2 w-4 h-4 cursor-pointer"
                                    onClick={() => handleRemoveTag(tag)}
                                />
                            </span>
                            </Badge>
                        ))}
                    </div>
                    {editedCampaign.tags.length < 5 && (
                        <div className="flex items-center gap-2">
                            <Input
                                className="w-[200px]"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a new tag"
                            />
                            <Button
                                onClick={handleAddTag}
                                className=""
                                disabled={!newTag}
                            >
                                Add
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="font-bold">Campaign image</h1>
                    <p className="text-gray-500 text-sm">Upload an image for your campaign.</p>
                </div>
                <div className="flex flex-col gap-4">
                    {editedCampaign.campaign_image && (
                        <img
                            src={editedCampaign.campaign_image}
                            alt="Campaign image"
                            className="rounded-md w-[200px] h-[200px] object-cover"
                        />
                    )}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer border-2 border-gray-200 rounded-md p-2 w-[200px]">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Upload className="w-5 h-5" />
                            <span>{isUploading ? 'Uploading...' : 'Upload image'}</span>
                        </label>
                        <Button 
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage || !editedCampaign.description}
                            className="flex items-center gap-2 w-[200px]"
                        >
                            <Sparkles className="w-5 h-5" />
                            {isGeneratingImage ? 'Generating...' : 'Generate with AI'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}