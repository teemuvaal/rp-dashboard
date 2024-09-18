'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CreateNote from '@/CreateNote'

export default function NotesList({ notes, onNoteUpdated }) {
  const [editingNoteId, setEditingNoteId] = useState(null)

  const handleEditNote = (noteId) => {
    setEditingNoteId(noteId)
  }

  const handleNoteUpdated = (updatedNote) => {
    onNoteUpdated(updatedNote)
    setEditingNoteId(null)
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="border p-4 rounded">
          {editingNoteId === note.id ? (
            <CreateNote note={note} onNoteUpdated={handleNoteUpdated} />
          ) : (
            <>
              <h3 className="text-lg font-semibold">{note.title}</h3>
              <p className="text-sm text-gray-500">By {note.author} on {new Date(note.created_at).toLocaleDateString()}</p>
              <div className="mt-2" dangerouslySetInnerHTML={{ __html: note.content }} />
              <p className="text-sm text-gray-500 mt-2">{note.is_public ? 'Public' : 'Private'} note</p>
              <Button onClick={() => handleEditNote(note.id)} className="mt-2">Edit Note</Button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}