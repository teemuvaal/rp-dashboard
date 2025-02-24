'use client'

import { useState, useEffect } from 'react'
import { fetchNote, updateNote, deleteNote } from '@/app/dashboard/actions'
import NoteDisplay from '@/components/Dashboard/NoteDisplay'
import CreateNote from '@/components/Dashboard/CreateNote'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
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
  } from "@/components/ui/alert-dialog"
  import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function NotePage({ params }) {
    const [note, setNote] = useState(null)
    const [error, setError] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()
    const campaignId = params.id

    useEffect(() => {
        const loadNote = async () => {
            const { note: fetchedNote, error } = await fetchNote(params.noteId)
            if (error) {
                setError(error)
            } else {
                setNote(fetchedNote)
            }
        }
        loadNote()
    }, [params.noteId])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleTogglePublic = async () => {
        const formData = new FormData()
        formData.append('noteId', note.id)
        formData.append('title', note.title)
        formData.append('content', note.content)
        formData.append('isPublic', !note.is_public)

        const result = await updateNote(formData)
        if (result.success) {
            setNote(result.note)
        } else {
            setError(result.error)
        }
    }

    const handleNoteUpdated = (updatedNote) => {
        setNote(updatedNote)
        setIsEditing(false)
    }

    const handleDelete = async () => {
        const result = await deleteNote(note.id)
        if (result.success) {
                router.push(`/dashboard/${params.id}/notes`)
            } else {
                setError(result.error)
        }
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!note) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-4 p-4">
            {isEditing ? (
                <CreateNote 
                    note={note} 
                    onNoteUpdated={handleNoteUpdated} 
                    campaignId={campaignId}
                />
            ) : (
                <>
                    <NoteDisplay note={note} />
                    <div className="flex space-x-2">
                        <Button onClick={handleEdit}>Edit Note</Button>
                        <Button onClick={handleTogglePublic}>
                            {note.is_public ? 'Make Private' : 'Make Public'}
                        </Button>
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Note</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to delete this note?</AlertDialogDescription>
                                </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </>
            )}
        </div>
    )
}