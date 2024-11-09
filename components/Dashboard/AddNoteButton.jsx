'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createNote } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import { UserPen } from 'lucide-react'

export default function AddNoteButton({ campaignId, type }) {
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const handleAddNote = async () => {
        setIsCreating(true)
        const formData = new FormData()
        formData.append('campaignId', campaignId)
        formData.append('title', 'New Note')
        formData.append('content', '')
        formData.append('isPublic', false)

        const result = await createNote(formData)
        setIsCreating(false)
        if (result.success) {
            router.push(`/dashboard/${campaignId}/notes/${result.note.id}`)
        } else {
            console.error('Error creating note:', result.error)
        }
    }

    return (
        <Button onClick={handleAddNote} disabled={isCreating} variant={type}
        >
            <span className="flex flex-row items-center">
                <UserPen className="w-4 h-4 mr-2" />
                {isCreating ? 'Creating...' : 'New Note'}
            </span>
        </Button>
    )
}