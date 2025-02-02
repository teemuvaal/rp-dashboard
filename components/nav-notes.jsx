'use client'

import { useEffect, useState } from 'react'
import { fetchNotes } from '@/app/dashboard/actions'
import Link from 'next/link'
import {
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { FileText, MoveRight } from 'lucide-react'
import { format } from 'date-fns'

export default function NavNotes({ campaignId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { notes: fetchedNotes } = await fetchNotes(campaignId)
        // Get 5 most recent notes
        const recentNotes = fetchedNotes
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
        setNotes(recentNotes)
      } catch (error) {
        console.error('Error loading notes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [campaignId])

  if (loading) {
    return (
      <div className="px-2 py-1.5">
        <span className="text-xs text-muted-foreground">Loading notes...</span>
      </div>
    )
  }

  return (
    <div className="py-1">
      {notes.map((note) => (
        <Link 
          key={note.id} 
          href={`/dashboard/${campaignId}/notes/${note.id}`}
          className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
        >
          <FileText className="h-3 w-3 min-w-[12px]" />
          <div className="ml-2 flex-1 min-w-0">
            <div className="text-xs font-medium truncate">
              {note.title}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {format(new Date(note.created_at), 'MMM d')}
            </div>
          </div>
        </Link>
      ))}
      
      <Link 
        href={`/dashboard/${campaignId}/notes`}
        className="flex items-center w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md mt-1"
      >
        <span className="text-xs">View all notes</span>
        <MoveRight className="h-3 w-3 ml-auto" />
      </Link>
    </div>
  )
} 