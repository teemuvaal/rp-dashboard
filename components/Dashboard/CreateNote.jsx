'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { updateNote, createNote } from '@/app/dashboard/actions'
import dynamic from 'next/dynamic'
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

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

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
    const [selectedSessionId, setSelectedSessionId] = useState(note.session_id || '')
    const supabase = createClient()

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

    // Fetch available sessions
    useEffect(() => {
        const fetchSessions = async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('id, name, scheduled_date')
                .eq('campaign_id', campaignId)
                .order('scheduled_date', { ascending: false });

            if (!error && data) {
                setSessions(data);
            }
        };
        fetchSessions();
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

        // Handle presence state changes
        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState()
            const users = Object.values(state).map(presence => presence[0])
            setPresentUsers(users)
        })

        // Subscribe and track presence
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
            if (note.id) {
                // Update existing note
                const formData = new FormData()
                formData.append('noteId', note.id)
                formData.append('title', title)
                formData.append('content', content)
                formData.append('isPublic', isPublic)
                formData.append('sessionId', selectedSessionId)

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
                const formData = new FormData()
                formData.append('campaignId', campaignId)
                formData.append('title', title)
                formData.append('content', content)
                formData.append('isPublic', isPublic)
                formData.append('sessionId', selectedSessionId)

                const result = await createNote(formData)
                if (result.success) {
                    // Reset form
                    setTitle('')
                    setContent('')
                    setIsPublic(false)
                    setSelectedSessionId('')
                    // Refresh the page to show the new note
                    router.refresh()
                } else {
                    setError(result.error || 'An error occurred while creating the note')
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error)
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
                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Link to session (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">No session</SelectItem>
                        {sessions.map(session => (
                            <SelectItem key={session.id} value={session.id}>
                                {session.name} ({formatSessionDate(session.scheduled_date)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="h-[60vh]">
                <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent}
                    className="h-[calc(100%-42px)]"
                    modules={{
                        toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link', 'image'],
                            ['clean']
                        ],
                        history: {
                            delay: 1000,
                            maxStack: 500,
                        }
                    }}
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