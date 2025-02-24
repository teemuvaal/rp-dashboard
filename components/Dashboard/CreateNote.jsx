'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { updateNote, createNote, fetchSessions } from '@/app/dashboard/actions'
import { cleanUpNote } from '@/app/dashboard/aiactions'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Wand2 } from "lucide-react"
import { ForwardRefEditor } from '@/utils/mdxeditor/ForwardRefEditor'

export default function CreateNote({ note, onNoteUpdated, campaignId }) {
    const router = useRouter();
    const [title, setTitle] = useState(note.title)
    const [content, setContent] = useState(note.content)
    const [isPublic, setIsPublic] = useState(note.is_public)
    const [error, setError] = useState(null)
    const [presentUsers, setPresentUsers] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sessions, setSessions] = useState([])
    const [selectedSessionId, setSelectedSessionId] = useState(note.session_id ? note.session_id : 'none')
    const supabase = createClient()
    const [isCleaning, setIsCleaning] = useState(false)
    const [cleanedContent, setCleanedContent] = useState(null)
    const [showCleanDialog, setShowCleanDialog] = useState(false)

    // Fetch current user with profile information
    useEffect(() => {
        const fetchUserWithProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (!error && user) {
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('username, profile_picture')
                    .eq('id', user.id)
                    .single()
                
                setCurrentUser({ ...user, ...userProfile })
            }
        }
        fetchUserWithProfile()
    }, [])

    // Fetch sessions
    useEffect(() => {
        const loadSessions = async () => {
            if (!campaignId) return;

            try {
                const result = await fetchSessions(campaignId);
                if (result.error) {
                    setError(result.error);
                    return;
                }
                
                if (result.sessions) {
                    setSessions(result.sessions);
                }
            } catch (error) {
                setError('Failed to load sessions');
            }
        };
        
        loadSessions();
    }, [campaignId]);

    // Presence effect for viewing users
    useEffect(() => {
        if (!currentUser || !note.id) return

        const channel = supabase.channel(`note:${note.id}`, {
            config: {
                presence: {
                    key: currentUser.id,
                },
            },
        })

        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState()
            const users = Object.values(state).map(presence => presence[0])
            setPresentUsers(users)
        })

        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track({
                    user_id: currentUser.id,
                    username: currentUser.username,
                    profile_picture: currentUser.profile_picture,
                    timestamp: new Date().toISOString(),
                })
            }
        })

        return () => {
            channel.unsubscribe()
        }
    }, [currentUser, note.id])

    const handleSubmit = async () => {
        setError(null)
        setIsSubmitting(true)

        try {
            const formData = new FormData()
            if (note.id) {
                // Update existing note
                formData.append('noteId', note.id)
                formData.append('title', title)
                formData.append('content', content)
                formData.append('isPublic', isPublic)
                if (selectedSessionId !== 'none') {
                    formData.append('sessionId', selectedSessionId)
                }

                const result = await updateNote(formData)
                if (result.success) {
                    if (onNoteUpdated) {
                        onNoteUpdated(result.note)
                    }
                } else {
                    setError(result.error || 'An error occurred while updating the note')
                }
            } else {
                // Create new note
                formData.append('campaignId', campaignId)
                formData.append('title', title)
                formData.append('content', content)
                formData.append('isPublic', isPublic)
                if (selectedSessionId !== 'none') {
                    formData.append('sessionId', selectedSessionId)
                }

                const result = await createNote(formData)
                if (result.success) {
                    setTitle('')
                    setContent('')
                    setIsPublic(false)
                    setSelectedSessionId('none')
                    router.refresh()
                } else {
                    setError(result.error || 'An error occurred while creating the note')
                }
            }
        } catch (error) {
            setError('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatSessionDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

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

    const acceptCleanedVersion = async () => {
        setContent(cleanedContent)
        
        // Save the cleaned content to the database
        const formData = new FormData()
        formData.append('noteId', note.id)
        formData.append('title', title)
        formData.append('content', cleanedContent)
        formData.append('isPublic', isPublic)
        if (selectedSessionId !== 'none') {
            formData.append('sessionId', selectedSessionId)
        }

        try {
            const result = await updateNote(formData)
            if (result.success) {
                if (onNoteUpdated) {
                    onNoteUpdated(result.note)
                }
            } else {
                setError(result.error || 'Failed to save cleaned note')
            }
        } catch (err) {
            setError('An unexpected error occurred while saving the cleaned note')
        }

        setCleanedContent(null)
        setShowCleanDialog(false)
    }

    return (
        <div className="space-y-4">
            {note.id && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{presentUsers.length} viewing</span>
                    <div className="flex -space-x-2">
                        {presentUsers.map((user) => (
                            <div
                                key={user.user_id}
                                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white overflow-hidden"
                                title={user.username || 'Anonymous'}
                            >
                                {user.profile_picture ? (
                                    <Image
                                        src={user.profile_picture}
                                        alt={user.username || 'User avatar'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-medium">
                                        {(user.username || 'A')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full p-2 border rounded"
                required
            />
            <div className="flex gap-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="isPublic">Make this note public</label>
                </div>
                <Select 
                    value={selectedSessionId} 
                    onValueChange={setSelectedSessionId}
                >
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Link to session (optional)" />
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
            </div>
            <div className="flex gap-2 items-center">
                <Button 
                    variant="outline" 
                    onClick={handleCleanUp}
                    disabled={isCleaning || !content}
                    className="gap-2"
                >
                    <Wand2 className="h-4 w-4" />
                    {isCleaning ? 'Formatting...' : 'Format with AI'}
                </Button>
            </div>

            <Dialog open={showCleanDialog} onOpenChange={setShowCleanDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Format using AI</DialogTitle>
                        <DialogDescription>
                            Review the cleaned up version of your note. You can accept it or keep your original version.
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

            <div className="h-[60vh] border rounded-md">
                <ForwardRefEditor
                    markdown={content}
                    onChange={setContent}
                />
            </div>
            <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Saving...' : (note.id ? 'Save Changes' : 'Create Note')}
            </Button>
        </div>
    )
}