import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function NoteDisplay({ note }) {
  return (
    <Card>
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <div className="text-sm text-gray-500">
        Created by {note.author} on {format(new Date(note.created_at), 'dd/MM/yyyy')}
      </div>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
    </div>
    </Card>
  )
}