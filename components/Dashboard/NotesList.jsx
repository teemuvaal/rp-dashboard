'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteNote, updateNote } from '@/app/dashboard/actions'
import { NotepadText, Trash2, Globe, Lock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { EmbeddingStatus } from '@/components/ui/embedding-status'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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

export default function NotesList({ notes = [], campaignId, error: listError }) {
    const router = useRouter()
    const [error, setError] = useState(listError || null)

    const handleTogglePublic = async (note) => {
        setError(null)
        try {
            const formData = new FormData()
            formData.append('noteId', note.id)
            formData.append('title', note.title)
            formData.append('content', note.content)
            formData.append('isPublic', (!note.is_public).toString())

            const result = await updateNote(formData)
            if (result.success) {
                router.refresh()
            } else {
                setError(result.error || 'Failed to update note')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        }
    }

    const handleDelete = async (noteId) => {
        setError(null)
        try {
            const result = await deleteNote(noteId)
            if (result.success) {
                router.refresh()
            } else {
                setError(result.error || 'Failed to delete note')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        }
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-destructive">Error: {error}</p>
            </div>
        )
    }

    if (!notes || notes.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No notes found. Create a new note to get started!</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {notes.map((note) => (
                <div
                    key={note.id}
                    className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/${campaignId}/notes/${note.id}`)}
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                            <NotepadText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium truncate">{note.title}</h3>
                                <div className="flex-shrink-0">
                                    <EmbeddingStatus contentType="note" contentId={note.id} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>By {note.author}</span>
                                <span>•</span>
                                <span>{format(new Date(note.created_at), 'dd/MM/yyyy')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                        <div 
                            className="flex items-center gap-2"
                            onClick={e => {
                                e.stopPropagation()
                                handleTogglePublic(note)
                            }}
                        >
                            <Lock className={`h-4 w-4 ${note.is_public ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
                            <Switch
                                checked={note.is_public}
                                onCheckedChange={() => handleTogglePublic(note)}
                            />
                            <Globe className={`h-4 w-4 ${note.is_public ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
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
                                    <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this note? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(note.id)
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
    )
}