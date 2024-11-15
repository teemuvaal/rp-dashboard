'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { updateNote } from '@/app/dashboard/actions'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import QuillCursors from 'quill-cursors'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// Register the cursors module with Quill
if (typeof window !== 'undefined') {
  const Quill = require('quill')
  Quill.register('modules/cursors', QuillCursors)
}

export default function CreateNote({ note, onNoteUpdated }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isPublic, setIsPublic] = useState(note.is_public)
  const [error, setError] = useState(null)
  const [presentUsers, setPresentUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [quillInstance, setQuillInstance] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [cursors, setCursors] = useState(null)
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

  // Separate presence effect
  useEffect(() => {
    if (!currentUser) return

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

  // Separate cursor and collaboration effect
  useEffect(() => {
    if (!currentUser || !quillInstance) return

    // Initialize cursors module
    const cursorsModule = quillInstance.getModule('cursors')
    setCursors(cursorsModule)

    const collaborationChannel = supabase.channel(`note:${note.id}:cursors`, {
      config: {
        broadcast: { self: true },
      },
    })

    // Enhanced cursor position handling
    collaborationChannel.on('broadcast', { event: 'cursor-update' }, ({ payload }) => {
      if (payload.sender !== currentUser.id && cursorsModule) {
        const { sender, range, username, color } = payload
        
        if (range === null) {
          cursorsModule.removeCursor(sender)
        } else {
          cursorsModule.createCursor(sender, username, color)
          cursorsModule.moveCursor(sender, range)
        }
      }
    })

    // Subscribe to collaboration channel
    collaborationChannel.subscribe()

    // Enhanced selection change handler
    const selectionHandler = (range, oldRange, source) => {
      if (source === 'user') {
        const cursorColor = `hsl(${Math.random() * 360}, 70%, 50%)`
        collaborationChannel.send({
          type: 'broadcast',
          event: 'cursor-update',
          payload: {
            range,
            sender: currentUser.id,
            username: currentUser.username,
            color: cursorColor
          }
        })
      }
    }

    // Handle editor blur to remove cursor
    const handleBlur = () => {
      collaborationChannel.send({
        type: 'broadcast',
        event: 'cursor-update',
        payload: {
          range: null,
          sender: currentUser.id
        }
      })
    }

    quillInstance.on('selection-change', selectionHandler)
    quillInstance.on('blur', handleBlur)

    return () => {
      quillInstance.off('selection-change', selectionHandler)
      quillInstance.off('blur', handleBlur)
      collaborationChannel.unsubscribe()
    }
  }, [quillInstance, currentUser, note.id])

  // Separate content synchronization effect
  useEffect(() => {
    if (!currentUser || !quillInstance) return

    const contentChannel = supabase.channel(`note:${note.id}:content`, {
      config: {
        broadcast: { self: false }, // Don't receive own changes
      },
    })

    // Handle incoming content changes
    contentChannel.on('broadcast', { event: 'content-update' }, ({ payload }) => {
      if (payload.sender !== currentUser.id) {
        const currentSelection = quillInstance.getSelection()
        
        // Temporarily disable event listeners to prevent echo
        quillInstance.off('text-change', handleTextChange)
        
        // Apply the changes
        quillInstance.updateContents(payload.delta, 'api')
        
        // Restore selection if it existed
        if (currentSelection) {
          quillInstance.setSelection(currentSelection)
        }
        
        // Re-enable event listeners
        quillInstance.on('text-change', handleTextChange)
      }
    })

    // Handle text changes
    const handleTextChange = (delta, oldContents, source) => {
      if (source === 'user') {
        contentChannel.send({
          type: 'broadcast',
          event: 'content-update',
          payload: {
            delta,
            sender: currentUser.id,
            timestamp: new Date().toISOString()
          }
        })
      }
    }

    // Subscribe to content channel and set up listeners
    contentChannel.subscribe()
    quillInstance.on('text-change', handleTextChange)

    return () => {
      quillInstance.off('text-change', handleTextChange)
      contentChannel.unsubscribe()
    }
  }, [quillInstance, currentUser, note.id])

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
          onChange={(value, delta, source, editor) => {
            setContent(value)
          }}
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
            cursors: {
              transformOnTextChange: true,
              hideDelayMs: 5000,
              hideSpeedMs: 300,
              selectionChangeSource: null,
              bound: true,
              template: `
                <span class="custom-cursor-container">
                  <span class="custom-cursor-flag">
                    <span class="custom-cursor-name"></span>
                  </span>
                  <span class="custom-cursor-caret"></span>
                </span>
              `
            },
            history: {
              userOnly: true,
              delay: 1000,
              maxStack: 500,
            },
            keyboard: {
              bindings: {
                // Add custom key bindings if needed
              }
            }
          }}
          ref={(ref) => {
            if (ref) {
              setQuillInstance(ref.getEditor())
            }
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