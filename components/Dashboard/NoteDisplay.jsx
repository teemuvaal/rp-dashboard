import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

export default function NoteDisplay({ note }) {
  return (
    <Card>
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <div className="text-sm text-gray-500">
        Created by {note.author} on {format(new Date(note.created_at), 'dd/MM/yyyy')}
      </div>
      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {note.content}
        </ReactMarkdown>
      </div>
    </div>
    </Card>
  )
}