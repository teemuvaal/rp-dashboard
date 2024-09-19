'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createNote } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'

export default function AddNoteButton({ campaignId }) {
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
        <Button onClick={handleAddNote} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'New Note'}
        </Button>
    )
}