import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { ForwardRefEditor } from '@/utils/mdxeditor/ForwardRefEditor'

export default function NoteDisplay({ note }) {
  return (
    <Card>
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">{note.title}</h1>
        <div className="text-sm text-gray-500">
          Created by {note.author} on {format(new Date(note.created_at), 'dd/MM/yyyy')}
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <ForwardRefEditor
            markdown={note.content}
            readOnly={true}
          />
        </div>
      </div>
    </Card>
  )
}