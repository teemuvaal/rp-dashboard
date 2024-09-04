'use client'

import { useState } from 'react'
import { updateCampaignDetails } from '@/app/dashboard/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pen, Pencil, Save, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditableCampaignDetails({ campaign, campaignId }) {
    const [editedCampaign, setEditedCampaign] = useState(campaign)
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
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
                        <p className="text-gray-500 text-sm">Tell us about your epic adventure. What is your tagli</p>
                    </span>
                    <span className="flex flex-row gap-2 items-center">
                        <p>{editedCampaign.description}</p>
                    <Pencil 
                        className="w-4 h-4 cursor-pointer hover:scale-110" 
                        onClick={() => setIsEditingDescription(true)} 
                    />
                </span>
                </div>
            )}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="font-bold">Campaign image</h1>
                    <p className="text-gray-500 text-sm">Upload an image for your campaign.</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <h1 className="font-bold text-gray-400">Coming soon! Generate your campaign image</h1>
                    <Sparkles className="text-gray-500 w-4 h-4 cursor-pointer hover:scale-110" />
                </div>
            </div>
        </div>
    )
}