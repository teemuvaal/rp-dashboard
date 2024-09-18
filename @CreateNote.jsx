'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createNote, updateNote } from '@/app/dashboard/actions'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function CreateNote({ note, onNoteUpdated }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isPublic, setIsPublic] = useState(note.is_public)
  const [error, setError] = useState(null)

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleUpdate()
    }, 1000)

    return () => clearTimeout(debounce)
  }, [title, content, isPublic])

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
      <ReactQuill 
        theme="snow" 
        value={content} 
        onChange={setContent}
      />
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
    </div>
  )
}