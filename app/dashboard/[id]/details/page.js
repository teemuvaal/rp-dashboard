'use client'

import { useEffect, useState } from 'react'
import { fetchCampaignDetails, updateCampaignDetails } from '@/app/dashboard/actions'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pen, Pencil, Save } from 'lucide-react'

export default function DetailsPage({ params }) {
    const [campaign, setCampaign] = useState(null)
    const [error, setError] = useState(null)
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)

    useEffect(() => {
        async function loadCampaignDetails() {
            const result = await fetchCampaignDetails(params.id)
            if (result.error) {
                setError(result.error)
            } else {
                setCampaign(result.campaign)
            }
        }

        loadCampaignDetails()
    }, [params.id])

    const handleSave = async (field) => {
        const updates = { [field]: campaign[field] }
        const result = await updateCampaignDetails(params.id, updates)
        if (result.error) {
            setError(result.error)
        } else {
            setCampaign(result.campaign)
        }
        if (field === 'name') setIsEditingName(false)
        if (field === 'description') setIsEditingDescription(false)
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!campaign) {
        return <div>Loading...</div>
    }

    return (
        <div className="w-full border-black border p-4 rounded-sm">
            <div className="flex flex-col gap-2">
                {isEditingName ? (
                    <span className="flex flex-row gap-2 items-center">
                        <Input 
                            className="w-[400px]" 
                            value={campaign.name} 
                            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })} 
                        />
                        <Save 
                            className="w-4 h-4 cursor-pointer hover:scale-110" 
                            onClick={() => handleSave('name')} 
                        />
                    </span>
                ) : (
                    <span className="flex flex-row gap-2 items-center">
                        <h1>{campaign.name}</h1>
                        <Pen 
                            className="w-4 h-4 cursor-pointer hover:scale-110" 
                            onClick={() => setIsEditingName(true)} 
                        /> 
                    </span>
                )}
            
                {isEditingDescription ? (
                    <span className="flex flex-col gap-2">
                        <Textarea 
                            className="w-[400px]" 
                            value={campaign.description} 
                            onChange={(e) => setCampaign({ ...campaign, description: e.target.value })} 
                        />
                        <Save 
                            className="w-4 h-4 cursor-pointer hover:scale-110" 
                            onClick={() => handleSave('description')} 
                        />
                    </span>
                ) : (
                    <span className="flex flex-row gap-2 items-center">
                        <p>{campaign.description}</p>
                        <Pencil 
                            className="w-4 h-4 cursor-pointer hover:scale-110" 
                            onClick={() => setIsEditingDescription(true)} 
                        />
                    </span>
                )}
            </div>
        </div>
    )
}