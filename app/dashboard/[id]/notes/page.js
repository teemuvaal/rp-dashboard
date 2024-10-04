import { fetchNotes } from '@/app/dashboard/actions'
import NotesList from '@/components/Dashboard/NotesList'
import AddNoteButton from '@/components/Dashboard/AddNoteButton'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default async function NotesPage({ params }) {
    const { notes, error } = await fetchNotes(params.id)

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <Card>
        <div className='flex flex-col'>
            <span className='p-4'>
            <AddNoteButton campaignId={params.id} />
            </span>
            <NotesList initialNotes={notes} campaignId={params.id} />
        </div>
        </Card>
    )
}