'use client'

import { useState, useEffect, useRef } from 'react'
import { fetchNote, updateNote, deleteNote } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { ForwardRefEditor } from '@/utils/mdxeditor/ForwardRefEditor'
import { cleanUpNote } from '@/app/dashboard/aiactions'
import { fetchSessions } from '@/app/dashboard/actions'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Wand2, Save, Eye, FileSync, Globe, Lock } from "lucide-react"

export default function NotePage({ params }) {
    const [note, setNote] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState([])
    const [content, setContent] = useState('')
    const [title, setTitle] = useState('')
    const [isPublic, setIsPublic] = useState(false)
    const [selectedSessionId, setSelectedSessionId] = useState('none')
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [isCleaning, setIsCleaning] = useState(false)
    const [cleanedContent, setCleanedContent] = useState(null)
    const [showCleanDialog, setShowCleanDialog] = useState(false)
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    
    const router = useRouter()
    const campaignId = params.id
    const titleInputRef = useRef(null)
    
    // Auto-save timer
    const autoSaveTimerRef = useRef(null)
    
    // Load note data
    useEffect(() => {
        const loadNote = async () => {
            setLoading(true)
            const { note: fetchedNote, error } = await fetchNote(params.noteId)
            if (error) {
                setError(error)
            } else {
                setNote(fetchedNote)
                setTitle(fetchedNote.title)
                setContent(fetchedNote.content)
                setIsPublic(fetchedNote.is_public)
                setSelectedSessionId(fetchedNote.session_id || 'none')
            }
            setLoading(false)
        }
        
        loadNote()
        
        // Load sessions for the campaign
        const loadSessions = async () => {
            try {
                const result = await fetchSessions(params.id)
                if (result.error) {
                    console.error('Error loading sessions:', result.error)
                    return
                }
                
                if (result.sessions) {
                    setSessions(result.sessions)
                }
            } catch (error) {
                console.error('Failed to load sessions:', error)
            }
        }
        
        loadSessions()
        
        // Focus the title input when the component mounts
        if (titleInputRef.current) {
            titleInputRef.current.focus()
        }
        
        // Cleanup function
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [params.noteId, params.id])
    
    // Set up auto-save
    useEffect(() => {
        if (!note || !unsavedChanges) return
        
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
        }
        
        autoSaveTimerRef.current = setTimeout(() => {
            handleSave(true)
        }, 5000) // Auto-save after 5 seconds of inactivity
        
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [content, title, isPublic, selectedSessionId, unsavedChanges])
    
    // Handle content change
    const handleContentChange = (newContent) => {
        setContent(newContent)
        setUnsavedChanges(true)
    }
    
    // Handle title change
    const handleTitleChange = (e) => {
        setTitle(e.target.value)
        setUnsavedChanges(true)
    }
    
    // Format with AI
    const handleCleanUp = async () => {
        setIsCleaning(true)
        setError(null)
        
        try {
            const result = await cleanUpNote(content)
            if (result.success) {
                setCleanedContent(result.cleanedNote)
                setShowCleanDialog(true)
            } else {
                setError(result.error || 'Failed to clean up note')
            }
        } catch (err) {
            setError('An unexpected error occurred while cleaning up the note')
        } finally {
            setIsCleaning(false)
        }
    }
    
    // Accept cleaned version
    const acceptCleanedVersion = () => {
        setContent(cleanedContent)
        setUnsavedChanges(true)
        setCleanedContent(null)
        setShowCleanDialog(false)
    }
    
    // Handle save
    const handleSave = async (isAutoSave = false) => {
        if (isSaving) return
        
        setIsSaving(true)
        setError(null)
        
        const formData = new FormData()
        formData.append('noteId', note.id)
        formData.append('title', title)
        formData.append('content', content)
        formData.append('isPublic', isPublic)
        
        if (selectedSessionId !== 'none') {
            formData.append('sessionId', selectedSessionId)
        }
        
        try {
            const result = await updateNote(formData)
            if (result.success) {
                setNote(result.note)
                setUnsavedChanges(false)
                setLastSaved(new Date())
                
                if (!isAutoSave) {
                    setSaveMessage('Note saved successfully!')
                    setTimeout(() => setSaveMessage(''), 3000)
                }
            } else {
                setError(result.error || 'An error occurred while saving the note')
            }
        } catch (error) {
            setError('An unexpected error occurred')
        } finally {
            setIsSaving(false)
        }
    }
    
    // Handle toggle public
    const handleTogglePublic = () => {
        setIsPublic(!isPublic)
        setUnsavedChanges(true)
    }
    
    // Handle delete
    const handleDelete = async () => {
        const result = await deleteNote(note.id)
        if (result.success) {
            router.push(`/dashboard/${params.id}/notes`)
        } else {
            setError(result.error)
        }
    }
    
    // Format session date
    const formatSessionDate = (dateString) => {
        const date = new Date(dateString)
        return format(date, 'MMM d, yyyy')
    }
    
    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <h2 className="text-lg font-semibold mb-2">Error</h2>
                <p>{error}</p>
                <Button 
                    onClick={() => router.push(`/dashboard/${params.id}/notes`)}
                    className="mt-4"
                >
                    Back to Notes
                </Button>
            </div>
        )
    }

    if (loading || !note) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-gray-500">Loading note...</div>
            </div>
        )
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-col space-y-4">
                {/* Header with controls */}
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Note Title"
                            className="w-full text-2xl font-bold bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:ring-0 px-0 py-2"
                        />
                        <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                            <div>Created: {format(new Date(note.created_at), 'MMM d, yyyy')}</div>
                            {lastSaved && <div>Last saved: {format(lastSaved, 'HH:mm:ss')}</div>}
                            {unsavedChanges && <div className="text-amber-600">Unsaved changes</div>}
                            {saveMessage && <div className="text-green-600">{saveMessage}</div>}
                        </div>
                    </div>
                    
                    <div className="flex space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleTogglePublic}
                        >
                            {isPublic ? (
                                <>
                                    <Globe className="h-4 w-4 mr-1" />
                                    Public
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 mr-1" />
                                    Private
                                </>
                            )}
                        </Button>
                        
                        <Select
                            value={selectedSessionId}
                            onValueChange={(value) => {
                                setSelectedSessionId(value)
                                setUnsavedChanges(true)
                            }}
                        >
                            <SelectTrigger className="w-[200px] h-9">
                                <SelectValue placeholder="Link to session" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No session</SelectItem>
                                {sessions.map(session => (
                                    <SelectItem key={session.id} value={session.id}>
                                        {session.name} ({formatSessionDate(session.scheduled_date)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCleanUp}
                            disabled={isCleaning || !content}
                        >
                            <Wand2 className="h-4 w-4 mr-1" />
                            Format
                        </Button>
                        
                        <Button
                            size="sm"
                            onClick={() => handleSave()}
                            disabled={isSaving || !unsavedChanges}
                        >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                        </Button>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">Delete</Button>
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
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                
                {/* Editor */}
                <div className="border rounded-md h-[calc(100vh-220px)]">
                    <ForwardRefEditor
                        markdown={content}
                        onChange={handleContentChange}
                    />
                </div>
            </div>
            
            {/* Format with AI Dialog */}
            <Dialog open={showCleanDialog} onOpenChange={setShowCleanDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Format using AI</DialogTitle>
                        <DialogDescription>
                            Review the formatted version of your note. You can accept it or keep your original.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        <div className="prose max-w-none p-4 border rounded-md bg-muted">
                            {cleanedContent && (
                                <ForwardRefEditor
                                    markdown={cleanedContent}
                                    readOnly={true}
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowCleanDialog(false)}>
                            Keep Original
                        </Button>
                        <Button onClick={acceptCleanedVersion}>
                            Accept New Version
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}