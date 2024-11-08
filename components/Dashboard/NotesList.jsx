'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { fetchNotes } from '@/app/dashboard/actions'
import Link from 'next/link'
import { LockKeyhole, Globe, MoveRight, NotepadText } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function NotesList({ initialNotes, campaignId }) {
  const [notes, setNotes] = useState(initialNotes)

  // useEffect to refresh notes every 30 seconds and keep records up to date
  useEffect(() => {
    const refreshNotes = async () => {
      const { notes: refreshedNotes, error } = await fetchNotes(campaignId)
      if (!error) {
        setNotes(refreshedNotes)
      }
    }

    // Refresh notes every 30 seconds
    const intervalId = setInterval(refreshNotes, 30000)

    return () => clearInterval(intervalId)
  }, [campaignId])

  return (
    <div className="p-4">
      {notes.map((note) => (       
        <Link key={note.id} href={`/dashboard/${campaignId}/notes/${note.id}`} passHref>
          <Card
          className="my-2"
          >
            <div className="flex items-center justify-between">
              <CardHeader>
              <CardTitle>
              <span className="flex items-center gap-2">
              {note.is_public ? <Globe className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                <h3 className="font-semibold">{note.title}</h3>
              </span>
              </CardTitle>
              </CardHeader>
            </div>
            <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
            </CardContent>
            <CardFooter>
            <p className="text-sm text-gray-500">
              By {note.author} on {format(new Date(note.created_at), 'dd/MM/yyyy')}
            </p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}