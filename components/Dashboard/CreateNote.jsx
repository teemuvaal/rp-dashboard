'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { updateNote } from '@/app/dashboard/actions'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function CreateNote({ note, onNoteUpdated }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isPublic, setIsPublic] = useState(note.is_public)
  const [error, setError] = useState(null)
  const [presentUsers, setPresentUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const supabase = createClient()

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!error && user) {
        setCurrentUser(user)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!currentUser) return // Don't set up channel until we have the user

    // Set up realtime presence channel
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

    // Subscribe to the channel and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: currentUser.id,
          email: currentUser.email,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Cleanup subscription
    return () => {
      channel.unsubscribe()
    }
  }, [note.id, currentUser])

  const handleUpdate = async () => {
    setError(null)

    const formData = new FormData()
    formData.append('noteId', note.id)
    formData.append('title', title)
    formData.append('content', content)
    formData.append('isPublic', isPublic)

    try {
      const result = await updateNote(formData)
      if (result.success) {
        onNoteUpdated(result.note)
      } else {
        console.error('Error updating note:', result.error)
        setError(result.error || 'An error occurred while updating the note')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{presentUsers.length} viewing</span>
        <div className="flex -space-x-2">
          {presentUsers.map((user, i) => (
            <div
              key={user.user_id}
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white"
              title={user.email}
            >
              {user.email?.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>
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
            ]
          }}
        />
      </div>
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
      <Button onClick={handleUpdate}>Save Changes</Button>
    </div>
  )
}