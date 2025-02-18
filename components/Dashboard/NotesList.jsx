'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { fetchNotes } from '@/app/dashboard/actions'
import Link from 'next/link'
import { LockKeyhole, Globe, MoveRight, NotepadText } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { EmbeddingStatus } from '@/components/ui/embedding-status'

// Memoize the note card to prevent unnecessary re-renders
const NoteCard = memo(({ note, campaignId }) => (
  <Link href={`/dashboard/${campaignId}/notes/${note.id}`} passHref>
    <Card className="my-2">
      <div className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              {note.is_public ? <Globe className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
              <h3 className="font-semibold">{note.title}</h3>
              <EmbeddingStatus contentType="note" contentId={note.id} />
            </span>
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {note.content.length > 200 ? `${note.content.substring(0, 200)}...` : note.content}
          </ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          By {note.author} on {format(new Date(note.created_at), 'dd/MM/yyyy')}
        </p>
      </CardFooter>
    </Card>
  </Link>
));

NoteCard.displayName = 'NoteCard';

export default function NotesList({ initialNotes, campaignId }) {
  const [notes, setNotes] = useState(initialNotes)

  // Memoize the refresh function to prevent unnecessary re-renders
  const refreshNotes = useCallback(async () => {
    const { notes: refreshedNotes, error } = await fetchNotes(campaignId)
    if (!error) {
      setNotes(refreshedNotes)
    }
  }, [campaignId]);

  useEffect(() => {
    // Refresh notes every 30 seconds
    const intervalId = setInterval(refreshNotes, 30000)
    return () => clearInterval(intervalId)
  }, [refreshNotes])

  return (
    <div className="p-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} campaignId={campaignId} />
      ))}
    </div>
  )
}