'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import CreateNote from '@/components/Dashboard/CreateNote'
import { fetchNotes, createNote } from '@/app/dashboard/actions'
import NotesList from '@/components/Dashboard/NotesList'

export default function NotesPage({ params }) {
    const [notes, setNotes] = useState([])

    useEffect(() => {
        const loadNotes = async () => {
            const fetchedNotes = await fetchNotes(params.id)
            setNotes(fetchedNotes)
        }
        loadNotes()
    }, [params.id])

    const handleAddNote = async () => {
        const formData = new FormData()
        formData.append('campaignId', params.id)
        formData.append('title', 'New Note')
        formData.append('content', '')
        formData.append('isPublic', false)

        const result = await createNote(formData)
        if (result.success) {
            setNotes([result.note, ...notes])
        } else {
            console.error('Error creating note:', result.error)
        }
    }

    const handleNoteUpdated = (updatedNote) => {
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
    }

    return (
        <div className='flex flex-col gap-4 mt-4'>
            <Button onClick={handleAddNote}>Add Note</Button>
            <NotesList notes={notes} onNoteUpdated={handleNoteUpdated} />
        </div>
    )
}