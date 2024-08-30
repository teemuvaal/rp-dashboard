'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CreateNote from '@/components/Dashboard/CreateNote'



export default function NotesPage() {
    const [tab, setTab] = useState('notes')
    return (
        <div
        className='flex flex-col gap-4 mt-4'
        >
        <span
        className='flex flex-row gap-4'
        >
        <Button onClick={() => setTab('notes')}>Notes</Button>
        <Button onClick={() => setTab('addnote')}>Add Note</Button>
        </span>
        <div>
        {tab === 'notes' ? (
        <div>
        <h1>Notes would be here</h1>
        </div>
        ) : (
            <div>
                <CreateNote />
            </div>
        )}
        </div>
        </div>
    )
    }