import CreateNote from '@/components/Dashboard/CreateNote'

export default function NotesList({ notes, onNoteUpdated }) {
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="border p-4 rounded">
          <CreateNote note={note} onNoteUpdated={onNoteUpdated} />
          <p className="text-sm text-gray-500">By {note.author} on {new Date(note.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}