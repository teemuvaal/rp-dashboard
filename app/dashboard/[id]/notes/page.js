import { fetchNotes } from '@/app/dashboard/actions'
import NotesList from '@/components/Dashboard/NotesList'
import AddNoteButton from '@/components/Dashboard/AddNoteButton'

export default async function NotesPage({ params }) {
    const { notes, error } = await fetchNotes(params.id)

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <div className='flex flex-col gap-4 mt-4'>
            <span>
            <AddNoteButton campaignId={params.id} />
            </span>
            <NotesList initialNotes={notes} campaignId={params.id} />
        </div>
    )
}